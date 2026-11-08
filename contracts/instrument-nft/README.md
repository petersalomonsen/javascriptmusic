# Instrument NFT contract

A publisher's catalogue of Faust instruments and songs on NEAR. Each publisher deploys their own copy. The source is stored in contract state and anyone can read it, so publishing proves what this publisher put out and when.

Songs credit the instruments they use. When a song is sold on a marketplace, its royalty goes to those instruments' owners, and the seller gets the rest.

Status: tested on a local NEAR sandbox and on testnet, including a real sale on Mintbase's testnet market. It isn't on mainnet yet.

## Build and test

You need Rust (`rustup`), Node.js, `curl` and [Binaryen](https://github.com/WebAssembly/binaryen). `build.sh` fetches a pinned checkout of [quickjs-rust-near](https://github.com/petersalomonsen/quickjs-rust-near), QuickJS and, if `emcc` isn't on your `PATH`, Emscripten.

```sh
cd contracts/instrument-nft
./build.sh
npm ci
npm test
```

You should see 19 passing tests, with the measured gas printed. CI runs the same steps in the `instrument-nft` job.

## How it works

| Call | Who | What it does |
|---|---|---|
| `new(owner_id, name, symbol)` | at deploy | Sets the owner and the collection's name |
| `publish_instrument(title, source, royalty_bps)` | contract owner | Mints token `i-<sha256 of source>` to the owner |
| `publish_song(title, source, credits, royalty_bps)` | contract owner | Mints `s-<sha256>`, crediting up to 9 instruments |
| `work(token_id)`, `source(token_id)` | view | Publisher, time, title, credits, source |
| `nft_approve` | token owner | Lets a marketplace sell the token (NEP-178) |
| `nft_payout`, `nft_transfer_payout` | marketplaces | Says who gets paid (NEP-199) |
| `post_javascript(javascript)` | contract owner | Replaces the default royalty rule |

There's no `buy`, and the contract never holds sale money: the marketplace pays everyone directly. The contract's own balance pays for storage, at about 0.01 NEAR per KB.

### Who gets paid

A work's `royalty_bps` is the most that can go to anyone but the seller. By default:

- A work with no credits pays its royalty to its publisher.
- A song with credits shares the royalty equally between them.
- An instrument in this contract pays its current owner, so the royalty follows the NFT.
- An instrument in another contract pays a fixed `payee` named when the song is published, because a view call can't read another contract:

```json
{ "token_id": "i-…", "contract": "other-publisher.near", "payee": "them.near" }
```

### Custom rules in JavaScript

Only the contract owner can post JavaScript. To replace the default rule, export a `payout` function that returns `{ accountId: amount }`:

```js
export function payout() {
  const { royalty, publisher, credits } = JSON.parse(env.sale_context());
  const half = BigInt(royalty) / 2n;
  return JSON.stringify({ [publisher]: half.toString(), [credits[0].payee]: (BigInt(royalty) - half).toString() });
}
```

`sale_context()` also gives `token_id`, `balance`, `seller`, `kind` and `royalty_bps`. Scripts can read works and tokens through `env.work(id)`, `env.source(id)` and `env.nft_token(id)`.

Rust refuses any result above the work's declared royalty, so a script can change who shares the royalty, but it can't take the seller's part. JavaScript has no call that writes contract state or sends money. A script that fails blocks sales in that one contract until the owner replaces it. Scripts apply to later sales of existing tokens as well.

## What it doesn't do

- It proves who published this exact text and when. It doesn't prove authorship: someone can publish work that isn't theirs.
- Exact copies are refused only within one contract. The same source in another publisher's contract has the same hash, and only the timestamps show who was first. Finding that needs something reading all the contracts, and so does spotting edited copies.
- Credits are voluntary, and a credit to another contract isn't checked: the token may not exist there, and the `payee` may not be its owner. Anyone can check this by reading both contracts.
- Royalties only apply to sales through marketplaces that honour NEP-199. A plain `nft_transfer` skips them.
- Marketplaces may refuse a contract. Mintbase's testnet market accepted this one, and Paras's refused it because its contract isn't on Paras's approved list.
- Whoever holds a full-access key on the contract account can deploy different code. A publisher who wants to rule that out can remove the key once they're happy with the contract.

## Baseline

Built on [quickjs-rust-near](https://github.com/petersalomonsen/quickjs-rust-near) at `53481b2`, an existing library by the same author, used for the JavaScript engine. This contract is new.

Everything before the `pre-hackathon` tag is earlier work: [changes since then](https://github.com/petersalomonsen/javascriptmusic/compare/pre-hackathon...instrument-nfts).
