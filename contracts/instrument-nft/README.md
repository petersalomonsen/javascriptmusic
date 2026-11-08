# Instrument NFT contract

Publish a Faust instrument or a song on NEAR. The source is stored in contract state, readable by anyone, and the first publisher is recorded. Songs name the instruments they use, and a sale credits those instruments' NFTs, so earnings follow whoever owns the instrument today.

Status: tested on a local NEAR sandbox. It isn't deployed to testnet or mainnet yet.

## Build and test

You need Rust (`rustup`), Node.js, `curl` and [Binaryen](https://github.com/WebAssembly/binaryen). `build.sh` fetches a pinned checkout of [quickjs-rust-near](https://github.com/petersalomonsen/quickjs-rust-near), QuickJS and, if `emcc` isn't on your `PATH`, Emscripten.

```sh
cd contracts/instrument-nft
./build.sh
npm ci
npm test
```

You should see 15 passing tests, with the measured gas printed. CI runs the same steps in the `instrument-nft` job.

## How it works

| Call | Who | What it does |
|---|---|---|
| `publish_instrument(title, source)` | anyone, pays storage | Mints token `i-<sha256 of source>` |
| `publish_song(title, source, instruments, instrument_share_bps)` | anyone, pays storage | Mints `s-<sha256>`, listing up to 9 published instruments and their share of a sale |
| `work(token_id)`, `source(token_id)` | view | Publisher, time, title, source |
| `list_for_sale`, `unlist`, `buy` | owner, owner, anyone | A sale inside the contract: instruments are credited and the seller is paid in one transaction |
| `earnings(token_id)`, `withdraw_earnings(token_id)` | view, current owner | What a token has earned, and collecting it |
| `pay_token(token_id)` | anyone | Pay a token directly |
| `nft_payout`, `nft_transfer_payout` | marketplaces | NEP-199 payouts, paid straight to the instruments' current owners |
| `post_javascript(javascript)` | contract owner | Custom sale split in JavaScript, through `song_split` |

The token ID comes from the source hash, so publishing identical source twice is refused, and the refusal names the first publisher.

JavaScript only proposes a split. Rust refuses any split that pays a token outside the song or adds up to more than the price. The JavaScript environment has no call that writes contract state or moves money.

## What it doesn't do

- It proves who published this exact text first. It doesn't prove authorship: someone can publish work that isn't theirs.
- An edited copy has a different hash, so it counts as a new work. Spotting near-copies is left to tools reading the public data.
- Crediting is voluntary. A song can name no instruments or set a 0% share.
- Royalties only apply to sales through this contract or marketplaces that honour NEP-199.
- Whoever holds a full-access key on the contract account can deploy different code. Locking that key is a decision for the mainnet deploy.

## Baseline

Built on [quickjs-rust-near](https://github.com/petersalomonsen/quickjs-rust-near) at `53481b2`, an existing library by the same author, used for the JavaScript engine. This contract is new.

Everything before the `pre-hackathon` tag is earlier work: [changes since then](https://github.com/petersalomonsen/javascriptmusic/compare/pre-hackathon...instrument-nfts).
