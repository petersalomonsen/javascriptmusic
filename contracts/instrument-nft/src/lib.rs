//! A publisher's catalogue of public Faust instruments and songs, as NFTs.
//!
//! Each publisher deploys their own copy. Only the contract owner publishes and
//! posts JavaScript. The source lives on chain and is readable by anyone, so
//! publishing proves what this publisher put out and when.
//!
//! Selling happens elsewhere: marketplaces use NEP-178 approvals and ask this
//! contract who gets paid (NEP-199). The contract holds no sale money, so the
//! JavaScript has none to reach. It can divide a work's royalty, but Rust caps
//! that royalty at what the work declared, which keeps the seller's part safe.

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
    PanicOnDefault, Promise, PromiseOrValue,
};
use quickjs_rust_near::jslib::{
    add_function_to_js, arg_to_str, compile_js, js_call_function, js_get_string, load_js_bytecode,
    to_js_string,
};
use std::collections::{BTreeMap, HashMap};
use std::ffi::{CStr, CString};

const JS_BYTECODE_KEY: &[u8] = b"JS";
const JS_HAS_PAYOUT_KEY: &[u8] = b"JS_PAYOUT";
const MAX_SOURCE_BYTES: usize = 64 * 1024;
const MAX_TITLE_BYTES: usize = 200;
/// NEP-199 says any payout of 10 or fewer must be accepted: nine credits and the seller.
const MAX_CREDITS: usize = 9;
const BPS: u128 = 10_000;

#[derive(BorshSerialize, BorshStorageKey)]
#[borsh(crate = "near_sdk::borsh")]
enum StorageKey {
    NonFungibleToken,
    TokenMetadata,
    Enumeration,
    Approval,
    Works,
    Sources,
}

#[near(serializers = [borsh, json])]
#[derive(Clone, PartialEq, Debug)]
pub enum WorkKind {
    Instrument,
    Song,
}

/// An instrument a song uses. One in this contract pays its current owner. One in
/// another contract pays the fixed `payee`, because a view call cannot read that
/// contract's owner, and nothing here checks that the token exists there.
#[near(serializers = [borsh, json])]
#[derive(Clone)]
pub struct Credit {
    pub token_id: TokenId,
    pub contract: Option<AccountId>,
    pub payee: Option<AccountId>,
}

/// What was published. The source is stored apart so a payout does not pay to read it.
#[near(serializers = [borsh, json])]
#[derive(Clone)]
pub struct Work {
    pub kind: WorkKind,
    pub title: String,
    pub sha256: String,
    pub publisher: AccountId,
    pub published_at_ms: u64,
    pub credits: Vec<Credit>,
    pub royalty_bps: u16,
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
    name: String,
    symbol: String,
    works: LookupMap<TokenId, Work>,
    sources: LookupMap<TokenId, String>,
}

static mut SALE_CONTEXT: Option<String> = None;
static mut CONTRACT_REF: *const Contract = std::ptr::null();

fn to_hex(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

fn emit(event: &str, data: serde_json::Value) {
    env::log_str(&format!(
        "EVENT_JSON:{}",
        serde_json::json!({ "standard": "wasm-music", "version": "2.0.0", "event": event, "data": [data] })
    ));
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: AccountId, name: String, symbol: String) -> Self {
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            name,
            symbol,
            works: LookupMap::new(StorageKey::Works),
            sources: LookupMap::new(StorageKey::Sources),
        }
    }

    fn assert_owner(&self) {
        require!(env::predecessor_account_id() == self.tokens.owner_id, "only the contract owner can do this");
    }

    // ---- publishing ---------------------------------------------------------

    /// Publish Faust source. The royalty goes to the publisher when it is resold.
    pub fn publish_instrument(&mut self, title: String, source: String, royalty_bps: u16) -> TokenId {
        self.publish(WorkKind::Instrument, "i", title, source, vec![], royalty_bps)
    }

    /// Publish a song. Its royalty is shared by the instruments it credits, or
    /// goes to the publisher if it credits none.
    pub fn publish_song(&mut self, title: String, source: String, credits: Vec<Credit>, royalty_bps: u16) -> TokenId {
        require!(credits.len() <= MAX_CREDITS, "too many credits");
        let here = env::current_account_id();
        let mut seen = vec![];
        for credit in &credits {
            let key = (credit.contract.clone(), credit.token_id.clone());
            require!(!seen.contains(&key), "instrument credited twice");
            seen.push(key);
            match &credit.contract {
                None => {
                    require!(credit.payee.is_none(), "an instrument in this contract pays its owner, not a payee");
                    require!(
                        self.works.get(&credit.token_id).map(|w| w.kind) == Some(WorkKind::Instrument),
                        format!("{} is not a published instrument", credit.token_id)
                    );
                }
                Some(contract) => {
                    require!(*contract != here, "leave out contract for an instrument in this contract");
                    require!(credit.payee.is_some(), "an instrument in another contract needs a payee");
                }
            }
        }
        self.publish(WorkKind::Song, "s", title, source, credits, royalty_bps)
    }

    fn publish(
        &mut self,
        kind: WorkKind,
        prefix: &str,
        title: String,
        source: String,
        credits: Vec<Credit>,
        royalty_bps: u16,
    ) -> TokenId {
        self.assert_owner();
        require!(!source.is_empty(), "empty source");
        require!(source.len() <= MAX_SOURCE_BYTES, "source larger than 64 KiB");
        require!(!title.is_empty() && title.len() <= MAX_TITLE_BYTES, "title must be 1-200 bytes");
        require!(u128::from(royalty_bps) <= BPS, "royalty above 100%");

        let sha256 = to_hex(&env::sha256(source.as_bytes()));
        let token_id = format!("{prefix}-{sha256}");
        if let Some(first) = self.works.get(&token_id) {
            env::panic_str(&format!("already published by {} at {}", first.publisher, first.published_at_ms));
        }

        let publisher = env::predecessor_account_id();
        let published_at_ms = env::block_timestamp_ms();
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
        // The contract's own balance pays this storage, so no deposit to refund.
        self.tokens.internal_mint_with_refund(token_id.clone(), publisher.clone(), Some(metadata), None);
        self.works.insert(
            &token_id,
            &Work { kind, title, sha256: sha256.clone(), publisher: publisher.clone(), published_at_ms, credits, royalty_bps },
        );
        self.sources.insert(&token_id, &source);

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

    fn owner_of(&self, token_id: &TokenId) -> AccountId {
        self.tokens.owner_by_id.get(token_id).unwrap_or_else(|| env::panic_str("no such token"))
    }

    // ---- royalties ----------------------------------------------------------

    fn payee_of(&self, credit: &Credit) -> AccountId {
        match &credit.payee {
            Some(payee) => payee.clone(),
            None => self.owner_of(&credit.token_id),
        }
    }

    /// Who shares the royalty, by default or as the posted JS says. Whatever the
    /// source, it can never add up to more than the work declared.
    fn royalties(&self, token_id: &TokenId, balance: u128, seller: &AccountId) -> BTreeMap<AccountId, u128> {
        let work = self.works.get(token_id).unwrap_or_else(|| env::panic_str("no such token"));
        let cap = balance
            .checked_mul(u128::from(work.royalty_bps))
            .unwrap_or_else(|| env::panic_str("balance too large"))
            / BPS;
        let shares = if env::storage_has_key(JS_HAS_PAYOUT_KEY) {
            self.js_royalties(token_id, &work, balance, cap, seller)
        } else {
            self.default_royalties(&work, cap)
        };
        let mut total: u128 = 0;
        for amount in shares.values() {
            total = total.checked_add(*amount).unwrap_or_else(|| env::panic_str("royalties overflow"));
        }
        require!(total <= cap, "royalties exceed what the work declared");
        shares
    }

    fn default_royalties(&self, work: &Work, cap: u128) -> BTreeMap<AccountId, u128> {
        let mut shares = BTreeMap::new();
        if work.credits.is_empty() {
            shares.insert(work.publisher.clone(), cap);
        } else {
            let each = cap / work.credits.len() as u128;
            for credit in &work.credits {
                *shares.entry(self.payee_of(credit)).or_insert(0) += each;
            }
        }
        shares
    }

    fn js_royalties(&self, token_id: &TokenId, work: &Work, balance: u128, cap: u128, seller: &AccountId) -> BTreeMap<AccountId, u128> {
        let credits: Vec<_> = work.credits.iter().map(|credit| serde_json::json!({
            "token_id": credit.token_id, "contract": credit.contract, "payee": self.payee_of(credit),
        })).collect();
        let context = serde_json::json!({
            "token_id": token_id, "balance": U128(balance), "royalty": U128(cap), "seller": seller,
            "publisher": work.publisher, "kind": work.kind, "credits": credits, "royalty_bps": work.royalty_bps,
        });
        let proposed: BTreeMap<AccountId, U128> = unsafe {
            #[allow(static_mut_refs)]
            {
                SALE_CONTEXT = Some(context.to_string());
            }
            let result = self.run_js("payout");
            serde_json::from_str(CStr::from_ptr(js_get_string(result) as *const i8).to_str().unwrap())
                .unwrap_or_else(|_| env::panic_str("payout must return { accountId: amount }"))
        };
        proposed.into_iter().map(|(account, amount)| (account, amount.0)).collect()
    }

    // ---- JavaScript ---------------------------------------------------------

    pub fn post_javascript(&mut self, javascript: String) {
        self.assert_owner();
        let has_payout = javascript.contains("export function payout");
        env::storage_write(JS_BYTECODE_KEY, &compile_js(javascript, Some("main.js".to_string())));
        if has_payout {
            env::storage_write(JS_HAS_PAYOUT_KEY, &[1]);
        } else {
            env::storage_remove(JS_HAS_PAYOUT_KEY);
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
                let id = arg_to_str(ctx, 0, argv);
                to_js_string(ctx, serde_json::to_string(&(*CONTRACT_REF).tokens.nft_token(id)).unwrap())
            },
            1,
        );
        add_function_to_js(
            "work",
            |ctx: i32, _this: i64, _argc: i32, argv: i32| -> i64 {
                let id = arg_to_str(ctx, 0, argv);
                to_js_string(ctx, serde_json::to_string(&(*CONTRACT_REF).works.get(&id)).unwrap())
            },
            1,
        );
        add_function_to_js(
            "source",
            |ctx: i32, _this: i64, _argc: i32, argv: i32| -> i64 {
                let id = arg_to_str(ctx, 0, argv);
                to_js_string(ctx, (*CONTRACT_REF).sources.get(&id).unwrap_or_default())
            },
            1,
        );
    }

    // ---- NEP-199 ------------------------------------------------------------

    /// Royalties go straight to their accounts and the seller gets the rest.
    pub fn nft_payout(&self, token_id: String, balance: U128, max_len_payout: Option<u32>) -> Payout {
        let seller = self.owner_of(&token_id);
        let shares = self.royalties(&token_id, balance.0, &seller);
        let to_others: u128 = shares.values().sum();
        let mut payout: HashMap<AccountId, U128> = HashMap::new();
        for (account, amount) in shares {
            if amount > 0 {
                payout.insert(account, U128(amount));
            }
        }
        if balance.0 > to_others {
            let held = payout.get(&seller).map_or(0, |v| v.0);
            payout.insert(seller, U128(held + balance.0 - to_others));
        }
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
            name: self.name.clone(),
            symbol: self.symbol.clone(),
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
