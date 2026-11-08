//! Public Faust instruments and songs as NFTs.
//!
//! The source lives on chain and is readable by anyone, so publishing proves who
//! published what and when. A token id is derived from the content hash, so exact
//! copies are refused. Songs name the instruments they use, and a sale through
//! `buy` credits those instrument tokens: earnings belong to the token, so
//! whoever owns it at withdrawal collects them.
//!
//! JavaScript customizes policy and never custody. It can propose how a song sale
//! splits, but only this file moves money, and it checks every proposal. The host
//! functions JS gets here cannot write storage, so a later `post_javascript`
//! cannot reach anyone's balance.

use near_contract_standards::non_fungible_token::events::NftMint;
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::{NonFungibleToken, Token, TokenId};
use near_sdk::borsh::BorshSerialize;
use near_sdk::collections::LookupMap;
use near_sdk::json_types::U128;
use near_sdk::{
    assert_one_yocto, env, near, near_bindgen, require, serde_json, AccountId, BorshStorageKey,
    NearToken, PanicOnDefault, Promise, PromiseOrValue,
};
use quickjs_rust_near::jslib::{
    add_function_to_js, compile_js, js_call_function, js_get_string, load_js_bytecode, to_js_string,
};
use std::collections::{BTreeMap, HashMap};
use std::ffi::{CStr, CString};

const JS_BYTECODE_KEY: &[u8] = b"JS";
const JS_HAS_SPLIT_KEY: &[u8] = b"JS_SPLIT";
const MAX_SOURCE_BYTES: usize = 64 * 1024;
const MAX_TITLE_BYTES: usize = 200;
/// NEP-199 says any payout of 10 or fewer must be accepted: nine instruments and the seller.
const MAX_INSTRUMENTS: usize = 9;
const BPS: u128 = 10_000;
/// Paid at publish and kept, so a later listing or balance needs no further deposit
/// and cannot slowly eat the contract's own storage balance.
const RESERVED_STORAGE_BYTES: u64 = 200;

#[derive(BorshSerialize, BorshStorageKey)]
#[borsh(crate = "near_sdk::borsh")]
enum StorageKey {
    NonFungibleToken,
    TokenMetadata,
    Enumeration,
    Approval,
    Works,
    Sources,
    Earnings,
    Listings,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, PartialEq, Debug)]
pub enum WorkKind {
    Instrument,
    Song,
}

/// What was published. The source is stored apart so a sale does not pay to read it.
#[near(serializers = [borsh, json])]
#[derive(Clone)]
pub struct Work {
    pub kind: WorkKind,
    pub title: String,
    pub sha256: String,
    pub publisher: AccountId,
    pub published_at_ms: u64,
    pub instruments: Vec<TokenId>,
    pub instrument_share_bps: u16,
}

#[near(serializers = [borsh, json])]
#[derive(Clone)]
pub struct Listing {
    pub price: U128,
    pub seller: AccountId,
}

#[near(serializers = [json])]
pub struct Payout {
    pub payout: HashMap<AccountId, U128>,
}

#[near_bindgen]
#[derive(PanicOnDefault)]
#[near(serializers = [borsh])]
pub struct Contract {
    tokens: NonFungibleToken,
    works: LookupMap<TokenId, Work>,
    sources: LookupMap<TokenId, String>,
    earnings: LookupMap<TokenId, u128>,
    listings: LookupMap<TokenId, Listing>,
}

static mut SALE_CONTEXT: Option<String> = None;
static mut CONTRACT_REF: *const Contract = std::ptr::null();

fn to_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

fn emit(event: &str, data: serde_json::Value) {
    env::log_str(&format!(
        "EVENT_JSON:{}",
        serde_json::json!({ "standard": "wasm-music", "version": "1.0.0", "event": event, "data": [data] })
    ));
}

fn yocto(amount: u128) -> NearToken {
    NearToken::from_yoctonear(amount)
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            works: LookupMap::new(StorageKey::Works),
            sources: LookupMap::new(StorageKey::Sources),
            earnings: LookupMap::new(StorageKey::Earnings),
            listings: LookupMap::new(StorageKey::Listings),
        }
    }

    // ---- publishing ---------------------------------------------------------

    /// Publish Faust source. The caller becomes publisher and first owner.
    #[payable]
    pub fn publish_instrument(&mut self, title: String, source: String) -> TokenId {
        self.publish(WorkKind::Instrument, "i", title, source, vec![], 0)
    }

    /// Publish a song, naming the instrument tokens it uses and the part of each
    /// sale they share (in basis points, split equally unless JS says otherwise).
    #[payable]
    pub fn publish_song(
        &mut self,
        title: String,
        source: String,
        instruments: Vec<TokenId>,
        instrument_share_bps: u16,
    ) -> TokenId {
        require!(instruments.len() <= MAX_INSTRUMENTS, "too many instruments");
        require!(u128::from(instrument_share_bps) <= BPS, "share above 100%");
        let mut unique = instruments.clone();
        unique.sort();
        unique.dedup();
        require!(unique.len() == instruments.len(), "instrument named twice");
        for id in &instruments {
            let work = self.works.get(id);
            require!(
                work.map(|w| w.kind) == Some(WorkKind::Instrument),
                format!("{id} is not a published instrument")
            );
        }
        self.publish(WorkKind::Song, "s", title, source, instruments, instrument_share_bps)
    }

    fn publish(
        &mut self,
        kind: WorkKind,
        prefix: &str,
        title: String,
        source: String,
        instruments: Vec<TokenId>,
        instrument_share_bps: u16,
    ) -> TokenId {
        require!(!source.is_empty(), "empty source");
        require!(source.len() <= MAX_SOURCE_BYTES, "source larger than 64 KiB");
        require!(!title.is_empty() && title.len() <= MAX_TITLE_BYTES, "title must be 1-200 bytes");

        let sha256 = to_hex(&env::sha256(source.as_bytes()));
        let token_id = format!("{prefix}-{sha256}");
        if let Some(first) = self.works.get(&token_id) {
            env::panic_str(&format!(
                "already published by {} at {}",
                first.publisher, first.published_at_ms
            ));
        }

        let publisher = env::predecessor_account_id();
        let published_at_ms = env::block_timestamp_ms();
        let storage_before = env::storage_usage();
        let metadata = TokenMetadata {
            title: Some(title.clone()),
            description: None,
            media: None,
            media_hash: None,
            copies: Some(1),
            issued_at: Some(published_at_ms.to_string()),
            expires_at: None,
            starts_at: None,
            updated_at: None,
            extra: Some(serde_json::json!({ "kind": kind, "sha256": sha256 }).to_string()),
            reference: None,
            reference_hash: None,
        };
        self.tokens.internal_mint_with_refund(token_id.clone(), publisher.clone(), Some(metadata), None);
        self.works.insert(
            &token_id,
            &Work {
                kind,
                title,
                sha256: sha256.clone(),
                publisher: publisher.clone(),
                published_at_ms,
                instruments,
                instrument_share_bps,
            },
        );
        self.sources.insert(&token_id, &source);
        self.earnings.insert(&token_id, &0);

        let bytes = env::storage_usage() - storage_before + RESERVED_STORAGE_BYTES;
        let cost = u128::from(bytes) * env::storage_byte_cost().as_yoctonear();
        let attached = env::attached_deposit().as_yoctonear();
        require!(attached >= cost, format!("attach at least {cost} yoctoNEAR for storage"));
        if attached > cost {
            Promise::new(publisher.clone()).transfer(yocto(attached - cost));
        }

        NftMint { owner_id: &publisher, token_ids: &[token_id.as_str()], memo: None }.emit();
        emit("publish", serde_json::json!({ "token_id": token_id, "sha256": sha256, "publisher": publisher }));
        token_id
    }

    pub fn work(&self, token_id: TokenId) -> Option<Work> {
        self.works.get(&token_id)
    }

    /// The published source, readable by anyone.
    pub fn source(&self, token_id: TokenId) -> Option<String> {
        self.sources.get(&token_id)
    }

    // ---- earnings -----------------------------------------------------------

    pub fn earnings(&self, token_id: TokenId) -> U128 {
        U128(self.earnings.get(&token_id).unwrap_or(0))
    }

    /// Send money to a token, e.g. for using an instrument. Its owner collects it.
    #[payable]
    pub fn pay_token(&mut self, token_id: TokenId) {
        let amount = env::attached_deposit().as_yoctonear();
        require!(amount > 0, "attach an amount");
        require!(self.works.get(&token_id).is_some(), "no such token");
        self.credit(&token_id, amount);
        emit("pay_token", serde_json::json!({ "token_id": token_id, "amount": U128(amount), "from": env::predecessor_account_id() }));
    }

    /// Collect what a token has earned. Only its current owner can.
    #[payable]
    pub fn withdraw_earnings(&mut self, token_id: TokenId) -> U128 {
        assert_one_yocto();
        let owner = self.owner_of(&token_id);
        require!(env::predecessor_account_id() == owner, "only the token owner can withdraw");
        let amount = self.earnings.get(&token_id).unwrap_or(0);
        require!(amount > 0, "nothing to withdraw");
        self.earnings.insert(&token_id, &0);
        Promise::new(owner.clone()).transfer(yocto(amount));
        emit("withdraw", serde_json::json!({ "token_id": token_id, "amount": U128(amount), "owner": owner }));
        U128(amount)
    }

    fn credit(&mut self, token_id: &TokenId, amount: u128) {
        let balance = self.earnings.get(token_id).unwrap_or(0);
        self.earnings.insert(token_id, &balance.checked_add(amount).expect("balance overflow"));
    }

    fn owner_of(&self, token_id: &TokenId) -> AccountId {
        self.tokens.owner_by_id.get(token_id).unwrap_or_else(|| env::panic_str("no such token"))
    }

    // ---- selling ------------------------------------------------------------

    #[payable]
    pub fn list_for_sale(&mut self, token_id: TokenId, price: U128) {
        assert_one_yocto();
        let owner = self.owner_of(&token_id);
        require!(env::predecessor_account_id() == owner, "only the token owner can list");
        require!(price.0 > 0, "price must be above zero");
        self.listings.insert(&token_id, &Listing { price, seller: owner });
    }

    #[payable]
    pub fn unlist(&mut self, token_id: TokenId) {
        assert_one_yocto();
        require!(env::predecessor_account_id() == self.owner_of(&token_id), "only the token owner can unlist");
        self.listings.remove(&token_id);
    }

    /// A listing only stands while the seller still owns the token, so one left
    /// behind by a plain transfer can never sell the new owner's token.
    pub fn listing(&self, token_id: TokenId) -> Option<Listing> {
        let listing = self.listings.get(&token_id)?;
        (self.tokens.owner_by_id.get(&token_id).as_ref() == Some(&listing.seller)).then_some(listing)
    }

    /// Buy a listed token. Instrument shares go to their tokens, the rest to the seller.
    #[payable]
    pub fn buy(&mut self, token_id: TokenId) {
        let listing = self.listing(token_id.clone()).unwrap_or_else(|| env::panic_str("not for sale"));
        let price = listing.price.0;
        let attached = env::attached_deposit().as_yoctonear();
        require!(attached >= price, format!("attach at least {price} yoctoNEAR"));
        let buyer = env::predecessor_account_id();

        let shares = self.split(&token_id, price, &listing.seller);
        let to_instruments: u128 = shares.values().sum();
        for (instrument, amount) in &shares {
            self.credit(instrument, *amount);
        }
        self.listings.remove(&token_id);
        self.tokens.internal_transfer(&listing.seller, &buyer, &token_id, None, None);

        Promise::new(listing.seller.clone()).transfer(yocto(price - to_instruments));
        if attached > price {
            Promise::new(buyer.clone()).transfer(yocto(attached - price));
        }
        emit("buy", serde_json::json!({
            "token_id": token_id, "price": listing.price, "seller": listing.seller, "buyer": buyer,
            "instrument_shares": shares.iter().map(|(k, v)| (k.clone(), U128(*v))).collect::<BTreeMap<_, _>>(),
        }));
    }

    /// How a sale splits across instrument tokens. JS may propose this, but the
    /// proposal can only name the song's own instruments and cannot exceed the price.
    fn split(&self, token_id: &TokenId, price: u128, seller: &AccountId) -> BTreeMap<TokenId, u128> {
        let work = self.works.get(token_id).unwrap_or_else(|| env::panic_str("no such token"));
        if work.instruments.is_empty() {
            return BTreeMap::new();
        }
        let shares = if env::storage_has_key(JS_HAS_SPLIT_KEY) {
            self.js_split(token_id, &work, price, seller)
        } else {
            let pool = price * u128::from(work.instrument_share_bps) / BPS;
            let each = pool / work.instruments.len() as u128;
            work.instruments.iter().map(|id| (id.clone(), each)).collect()
        };
        let mut total: u128 = 0;
        for (id, amount) in &shares {
            require!(work.instruments.contains(id), format!("split names {id}, which the song does not use"));
            total = total.checked_add(*amount).unwrap_or_else(|| env::panic_str("split overflows"));
        }
        require!(total <= price, "split exceeds the price");
        shares
    }

    fn js_split(&self, token_id: &TokenId, work: &Work, price: u128, seller: &AccountId) -> BTreeMap<TokenId, u128> {
        let context = serde_json::json!({
            "token_id": token_id, "price": U128(price), "seller": seller, "publisher": work.publisher,
            "instruments": work.instruments, "instrument_share_bps": work.instrument_share_bps,
        });
        let proposed: BTreeMap<TokenId, U128> = unsafe {
            #[allow(static_mut_refs)]
            {
                SALE_CONTEXT = Some(context.to_string());
            }
            let result = self.run_js("song_split");
            serde_json::from_str(CStr::from_ptr(js_get_string(result) as *const i8).to_str().unwrap())
                .unwrap_or_else(|_| env::panic_str("song_split must return { tokenId: amount }"))
        };
        proposed.into_iter().map(|(id, amount)| (id, amount.0)).collect()
    }

    // ---- JavaScript ---------------------------------------------------------

    pub fn post_javascript(&mut self, javascript: String) {
        require!(env::predecessor_account_id() == self.tokens.owner_id, "Unauthorized");
        let has_split = javascript.contains("export function song_split");
        env::storage_write(JS_BYTECODE_KEY, &compile_js(javascript, Some("main.js".to_string())));
        if has_split {
            env::storage_write(JS_HAS_SPLIT_KEY, &[1]);
        } else {
            env::storage_remove(JS_HAS_SPLIT_KEY);
        }
    }

    /// Run a view function from the posted JS.
    pub fn call_js_func(&self, function_name: String) {
        self.run_js(&function_name);
    }

    pub fn web4_get(&self) {
        self.run_js("web4_get");
    }

    fn run_js(&self, function_name: &str) -> i64 {
        let bytecode = env::storage_read(JS_BYTECODE_KEY).unwrap_or_else(|| env::panic_str("no JavaScript posted"));
        let module = load_js_bytecode(bytecode.as_ptr(), bytecode.len());
        let name = CString::new(function_name).unwrap();
        unsafe {
            self.add_js_functions();
            js_call_function(module, name.as_ptr() as i32)
        }
    }

    /// Read-only by construction: nothing here writes storage or sends money.
    unsafe fn add_js_functions(&self) {
        CONTRACT_REF = self as *const Contract;
        add_function_to_js(
            "sale_context",
            |ctx: i32, _this: i64, _argc: i32, _argv: i32| -> i64 {
                #[allow(static_mut_refs)]
                to_js_string(ctx, SALE_CONTEXT.clone().unwrap_or_default())
            },
            0,
        );
        add_function_to_js(
            "nft_token",
            |ctx: i32, _this: i64, _argc: i32, argv: i32| -> i64 {
                let id = quickjs_rust_near::jslib::arg_to_str(ctx, 0, argv);
                to_js_string(ctx, serde_json::to_string(&(*CONTRACT_REF).tokens.nft_token(id)).unwrap())
            },
            1,
        );
        add_function_to_js(
            "work",
            |ctx: i32, _this: i64, _argc: i32, argv: i32| -> i64 {
                let id = quickjs_rust_near::jslib::arg_to_str(ctx, 0, argv);
                to_js_string(ctx, serde_json::to_string(&(*CONTRACT_REF).works.get(&id)).unwrap())
            },
            1,
        );
        add_function_to_js(
            "source",
            |ctx: i32, _this: i64, _argc: i32, argv: i32| -> i64 {
                let id = quickjs_rust_near::jslib::arg_to_str(ctx, 0, argv);
                to_js_string(ctx, (*CONTRACT_REF).sources.get(&id).unwrap_or_default())
            },
            1,
        );
    }

    // ---- NEP-199 ------------------------------------------------------------

    /// For outside marketplaces. Their plain transfers can't say which token a
    /// payment is for, so here shares go straight to the instruments' current owners.
    pub fn nft_payout(&self, token_id: String, balance: U128, max_len_payout: Option<u32>) -> Payout {
        let seller = self.owner_of(&token_id);
        let shares = self.split(&token_id, balance.0, &seller);
        let mut payout: HashMap<AccountId, U128> = HashMap::new();
        let mut to_instruments = 0;
        for (instrument, amount) in &shares {
            to_instruments += amount;
            let owner = self.owner_of(instrument);
            let held = payout.get(&owner).map_or(0, |v| v.0);
            payout.insert(owner, U128(held + amount));
        }
        let held = payout.get(&seller).map_or(0, |v| v.0);
        payout.insert(seller, U128(held + balance.0 - to_instruments));
        if let Some(max) = max_len_payout {
            require!(payout.len() <= max as usize, "payout too long");
        }
        Payout { payout }
    }

    #[payable]
    pub fn nft_transfer_payout(
        &mut self,
        receiver_id: AccountId,
        token_id: String,
        approval_id: Option<u64>,
        memo: Option<String>,
        balance: U128,
        max_len_payout: Option<u32>,
    ) -> Payout {
        assert_one_yocto();
        let payout = self.nft_payout(token_id.clone(), balance, max_len_payout);
        self.nft_transfer(receiver_id, token_id, approval_id, memo);
        payout
    }
}

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        NFTContractMetadata {
            spec: NFT_METADATA_SPEC.to_string(),
            name: "WebAssembly Music instruments".to_string(),
            symbol: "WASMMUSIC".to_string(),
            icon: None,
            base_uri: None,
            reference: None,
            reference_hash: None,
        }
    }
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);
