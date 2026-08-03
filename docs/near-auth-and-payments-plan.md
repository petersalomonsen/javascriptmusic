# NEAR auth & payments plan — mainnet/testnet, x402, NEAR AI credits

Status: **plan / research** (August 2026). Supersedes PR #116 (closed), which
replaced the NEAR wallet login with the browser Credential Management API.

**Decisions taken** (2026-08-02):

- **Passkeys: NOT NOW.** Every credible passkey route costs more than it buys
  today — see §1.1. Users bring their own NEAR account (any wallet, mainnet or
  testnet). Revisit when the blockers in §1.1 clear.
- **x402 settlement → a hosted facilitator** (x402.org on testnet,
  `x402.mikedotexe.com` for mainnet USDC). Self-hosting stays possible; the
  facilitator URL is configuration, not a hard-coded assumption.
- **Implementation order → Phase 1 first** (mainnet + testnet plumbing).

Two things this plan covers:

1. **Networks** — make mainnet *and* testnet first-class, instead of the
   testnet pin in `wasmgit/nearacl.js` and the mainnet pin in the gitproxy.
2. **Payments** — an **x402** gateway in front of the AI proxy
   (`functions/nearai/`) and the git CORS proxy (`functions/gitproxy/`), plus
   the "bring your own NEAR AI credits" path (including credits earned by
   **staking NEAR**).

Dropping passkeys makes the rest *simpler*, not just smaller: a user who brings
their own wallet has a full-access key, which is exactly what the x402 NEAR
`exact` scheme requires (§1.3). The awkward case — an account that can log in
but cannot pay — disappears.

---

## 1. Research findings

### 1.1 Passkeys on NEAR — three different things wear that name

| | What it is | Gives you a real NEAR account? | Can sign NEP-413? | Can sign NEP-366 delegate (needed for x402 `exact`)? |
|---|---|---|---|---|
| **A. `@near-wallet-selector/webauthn-wallet`** | Passkey → deterministic ed25519 key; account created by *your* relayer | Yes (named account) | Yes (`signNep413Message`) | Yes, if the key is full-access |
| **B. NEAR Auth** (`docs.auth.near.org`, ex-FastAuth) | Auth0 login (Google / Apple / email / **passkey**) → key secured by an **MPC** network; deterministic per identity | Yes | Yes | Yes |
| **C. NEAR Intents wallet contract** (`near/intents`, `contracts/wallet`) | Account-abstraction wallet contract whose signing standard *is* the passkey (p256 or ed25519) | Yes — account ID **deterministically derived from the public key** (NEP-616), zero-balance (NEP-448), deployed as a global contract (NEP-591) | No — it verifies a WebAuthn assertion in-contract, not an access-key signature | **No** — it has no access keys at all |

**What near.com actually uses is (C)** — the intents/AA route. Its case study
describes logging in with "a passkey wallet, any EVM wallet, or a NEAR native
wallet" and having one key across 31 chains; on-chain that is the intents
wallet contract, which supports "**passkeys** (both `p256` and `ed25519`)" as
signing standards. [NEP-635](https://github.com/near/NEPs/blob/master/neps/nep-0635.md)
(Draft, last updated 2026-07-06) adds a native `p256_verify` host function
specifically because "Near Intents relies on passkeys (WebAuthn), which use
P-256 ECDSA" — WASM P-256 verification costs ~46 Tgas vs ~0.45 Tgas native.

**Decision: ship none of them for now.** Users create their own NEAR account
with any wallet, on whichever network the repo they open lives on. Each option
is blocked on something outside our control:

- **(A) is unsafe as written.** `webauthn-utils.ts` derives the NEAR secret key
  as `SHA-256(credential.rawId)`. The credential ID is *not* a secret — the
  relying party stores it and sends it back in `allowCredentials` on every
  authentication. Anyone who observes a credential ID can compute the
  private key. It also has no cross-device recovery (new device = new
  credential ID = different account) and needs us to run an account-creation
  relayer. Do not use it for anything holding value.
  *Unblocks when:* it moves to the WebAuthn **PRF** extension (a device-held
  secret, not a public identifier). Watch the package, don't wait for it.
- **(B) NEAR Auth is technically the best fit but gated on someone else's
  queue.** The MPC-derived key is a normal NEAR access key, so NEP-413 signing,
  the gitproxy gate, NEAR AI login and x402 delegate signing would all work
  unchanged, and passkey is one of the Auth0 connection types. But **mainnet
  requires an approved Auth0 client id** ([application form](https://form.typeform.com/to/VWHjf3HV));
  only testnet works today. Building a login we cannot ship to mainnet — and
  whose ship date is an external approval — is not worth the code.
  *Unblocks when:* we hold an approved mainnet client id. `npm i
  @fast-auth-near/browser-sdk @fast-auth-near/javascript-provider`, client
  pointed at `fast-auth.near` + `v1.signer`.
- **(C) the near.com route is the future, but not yet.** Its own README says
  "**This implementation has not been audited yet. DO NOT store any significant
  funds on it**", the cheap on-chain verification path (NEP-635) is still a
  Draft NEP, and an AA account has no access key — which breaks *both* our
  NEP-413 proxy gate and the x402 NEAR `exact` scheme (§1.3).
  *Unblocks when:* NEP-635 ships and the wallet contract is audited. Then this
  becomes the right answer, because it needs no third-party identity provider
  at all — but it also means teaching the proxy gate to verify WebAuthn
  assertions and finding a non-`exact` payment rail (§1.4).

**Cost of skipping:** onboarding stays "get a NEAR wallet first", which is a
real funnel loss for the browser-first audition story. That is a deliberate
trade for not owning an Auth0 dependency, an account-creation relayer, or an
unaudited AA contract.

### 1.2 NEAR AI Cloud — NEP-413 login and staking-for-credits both already exist

Verified against [`nearai/cloud-api`](https://github.com/nearai/cloud-api) and
the live OpenAPI (`https://cloud-api.near.ai/api-docs/openapi.json`, 104 paths).

**NEP-413 login is a first-class auth method** (`POST /v1/auth/near`, not in the
OpenAPI because auth routes are excluded). Exact contract, from
`crates/services/src/auth/near.rs`:

- `payload.message` **must be exactly** `"Sign in to NEAR AI Cloud"`
- `payload.recipient` must equal the server's `NEAR_EXPECTED_RECIPIENT` —
  `cloud.near.ai`
- `payload.nonce` is 32 bytes: `[8 bytes big-endian ms timestamp][24 random]`,
  max age **5 minutes**, consumed once (replay-protected server-side)
- request body: `{ signedMessage: { accountId, publicKey, signature, state? },
  payload: { message, nonce, recipient, callbackUrl? } }`
- response: `{ access_token (1h JWT), refresh_token (7d),
  refresh_token_expiration, user }`

→ **A user who signs in to our app with a NEAR wallet can, with the same kind of
signature, authenticate to NEAR AI Cloud and spend their own credits.** We never
hold their key and never pay for their tokens.

**Staking for credits = "House of Stake" farm credits**, implemented in
`crates/services/src/staking_farm.rs` (`CREDIT_TYPE_STAKING_FARM`,
`CREDIT_SOURCE_HOUSE_OF_STAKE`):

| Endpoint | Purpose |
|---|---|
| `GET /v1/staking/farm/config` | `contract_id`, `farm_product_id`, `credit_nano_usd_per_reward_unit`, `sync_staleness_seconds` |
| `GET /v1/organizations/{org}/staking/farm` | accumulated / pending / total reward units, `farm_credit_nano_usd`, sync status, active positions |
| `POST /v1/organizations/{org}/staking/farm/sync` | pull on-chain reward units → credits |
| `GET /v1/organizations/{org}/usage/balance` | remaining balance |

The organization must be the NEAR-authenticated user's **default organization**.
Staked NEAR is locked, not spent — press coverage frames it as "lock NEAR,
receive compute credits proportional to stake; unstake to get it back."

**Per-key spend limits** (already researched, still current): `POST
/v1/workspaces/{ws}/api-keys` with `spendLimit: {amount, scale: 9, currency:
"USD"}` returns the `sk-` key once; `PATCH .../api-keys/{id}/spend-limit` raises
the lifetime limit — i.e. prepaid-credit semantics. **This is our metering
primitive: NEAR AI does the accounting, we stay stateless.**

**Can a browser skip our proxy and call NEAR AI directly?** No — measured
2026-08-02 against the live API:

| Origin | Preflight result |
|---|---|
| `https://near.ai` | `access-control-allow-origin: https://near.ai` |
| `https://chat.near.ai` | allowed |
| `http://localhost:8080` | allowed |
| `https://webassemblymusic.pages.dev` | 200, but **no `access-control-allow-origin`** → browser blocks |
| `https://foo.pages.dev` | blocked (no blanket `*.pages.dev`) |

The preflight returns `access-control-allow-methods: *` and
`access-control-allow-headers: *` either way, so it *looks* permissive; the
missing `ACAO` is what actually blocks it. The OHTTP relay (`POST /ohttp`)
shares the same CORS layer and does **not** bypass it.

The allowlist is a plain env var — `CORS_ALLOWED_ORIGINS` in
`crates/config/src/types.rs`, supporting exact matches and wildcard suffixes
(`*.near.ai`), applied via `AllowOrigin::predicate` in `crates/api/src/lib.rs`.
So **adding our origin is a one-line config change on their deployment**, and
CORS is not a security boundary here: these endpoints authenticate with a
Bearer key, not cookies, so a permissive origin policy grants no ambient
authority. Worth opening an issue on `nearai/cloud-api` — but ask, don't wait
(same trap as the Auth0 form in §1.1). Until then the proxy is not optional,
and on `localhost` the app already goes direct via `resolveDefaultBaseUrl()`.

There is **no** x402 support and no crypto top-up endpoint in the NEAR AI Cloud
API today (searched; zero hits for `x402`). Card top-up happens in their
dashboard.

### 1.3 x402 on NEAR — an official scheme exists, and so do hosted facilitators

The x402 Foundation repo has a **NEAR `exact` scheme**:
[`specs/schemes/exact/scheme_exact_near.md`](https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_near.md),
with a reference implementation in `@x402/near`
(`typescript/packages/mechanisms/near`, contributed by @mikedotexe).

- **x402 v2 only.** Networks are CAIP-2: `near:mainnet`, `near:testnet`.
- The client signs a **NEP-366 `SignedDelegateAction`** authorizing **exactly
  one** NEP-141 `ft_transfer`; a **facilitator-selected relayer sponsors the
  gas**, so *the payer needs no NEAR at all*.
- Flow: `402` + `PAYMENT-REQUIRED` header → client retries with
  `PAYMENT-SIGNATURE` → resource server calls facilitator `verify` then
  `settle` → response carries `PAYMENT-RESPONSE`.
- `PaymentRequirements` is small: `{scheme:"exact", network:"near:mainnet",
  amount:"1000000", asset:"<ft contract>", payTo:"<account>",
  maxTimeoutSeconds:60}`.
- Timeout mapping is fixed: `estimatedBlockSeconds = 1`, so
  `max_block_height = current + ceil(maxTimeoutSeconds)`.
- Replay protection uses the **on-chain access-key nonce** — no facilitator
  storage needed.
- **The payer must use a FullAccess key.** `ft_transfer` requires exactly 1
  yoctoNEAR attached, and NEAR function-call access keys cannot attach a
  positive deposit. → *This is why an AA/passkey account (option C above)
  cannot pay via this scheme.*

**Hosted facilitators that already cover NEAR** (from
`docs/dev-tools/facilitators.md`):

- **NEAR x402 Facilitator** — <https://x402.mikedotexe.com/> — "exact Circle
  USDC payments on NEAR and Base, with sponsored gas and durable settlement
  recovery"
- **Solvador** — <https://solvador.com> — multi-network incl. NEAR
- **x402.org facilitator** — testnet development only, explicitly not for
  mainnet

So **v1 does not need us to run a relayer**. Self-hosting stays an option
(`examples/typescript/servers/self-facilitation`).

**Browser signing is available.** The app already uses
[`@hot-labs/near-connect`](https://github.com/azbang/near-connect), which
exposes `wallet.signDelegateActions({ delegateActions: [...] })` (meta
transactions) alongside `signMessage` (NEP-413). Per-wallet support still needs
verifying for the wallets we care about.

**Payment asset** — verified live on mainnet via `ft_metadata`:

| Token | Contract | Decimals |
|---|---|---|
| USDC (Circle-native on NEAR) | `17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1` | 6 |
| USDt | `usdt.tether-token.near` | 6 |

### 1.4 OutLayer (FASTNEAR) — adjacent, and useful in two specific places

[OutLayer](https://outlayer.fastnear.com/docs/getting-started)
([`fastnear/near-outlayer`](https://github.com/fastnear/near-outlayer)) is
off-chain code execution for NEAR contracts with Intel TDX attestation. It is
not an x402 facilitator and does not change the direction above — its own
`402` means "insufficient balance on your Payment Key", not the x402 handshake.
Two of its pieces are directly relevant anyway:

**Payment Checks — a gasless rail that works for accounts x402 `exact` cannot
serve.** `POST /wallet/v1/payment-check/{create,peek,claim,reclaim}`: the TEE
derives an ephemeral key, moves tokens through the **NEAR Intents solver
relay** using off-chain **NEP-413** signatures, and hands over a `check_key`.
No gas on either side, no on-chain account for the receiver, partial claims,
and the sender can reclaim unclaimed funds. Crucially it needs **no full-access
key and no NEP-366 delegate** — the exact constraint that locks AA/passkey
accounts out of x402's NEAR `exact` scheme (§1.3).

Not needed while passkeys are out of scope (§1.1): a user who brings their own
wallet has a full-access key and can pay via `exact`. Recorded because it is
the answer *if* option (C) ever becomes the login story — and because both
sides needing an OutLayer wallet API key (`wk_…`) makes it a fallback rather
than something to reach for first.

**Payment Keys — the metering shape we want, already built.** A prepaid USDC
balance addressed by `X-Payment-Key: owner:nonce:secret`, with a per-call cap
(`X-Compute-Limit`, USD micro-units), `402` when the balance runs out, and
public `/public/payment-keys/{owner}/{nonce}/{balance,usage}`. Worth reading as
a reference for our Phase 5 design even if we meter via NEAR AI spend limits.

Also noted: OutLayer's TEE **Secrets** / **Agent Custody** could hold the NEAR
AI key or an x402 relayer key with attestation instead of a Cloudflare secret —
relevant only if we self-host the facilitator.

**Client-side reference:** [`Kampouse/near-pay`](https://github.com/Kampouse/near-pay)
(Rust) auto-pays `402`s using **both x402 and MPP** — MPP being an IETF-draft
alternative that signals payment via `WWW-Authenticate: Payment` headers rather
than a JSON body. If we ever want our proxies to be payable by non-x402 agents,
MPP is the second header dialect to support; the underlying settlement is
unchanged.

### 1.5 Where the repo stands today

Rows marked ✅ were changed by Phase 1 (below); the rest is untouched.

| File | State |
|---|---|
| `wasmaudioworklet/near/network.js` | ✅ **new** — shared network resolution (browser + service worker + Pages Functions) |
| `wasmaudioworklet/wasmgit/nearacl.js` | ✅ network derived from the repo contract id (was: testnet hardcoded); key in `localStorage['near-git-key:<contractId>']` |
| `wasmaudioworklet/login.html` | ✅ derives the network the same way (`?network=` only breaks ties). Uses `@hot-labs/near-connect`; adds a *function-call* key scoped to `push` |
| `wasmaudioworklet/near-git-sw.js` | ✅ uses the shared helper; mainnet git off the legacy `rpc.mainnet.near.org` |
| `wasmaudioworklet/functions/gitproxy/[[path]].js` | ✅ `authConfig(env)` replaces the mainnet constants. NEP-413 verifier + NFT gate + **HS256 `jwtSign`/`jwtVerify` already written and tested**; `REQUIRE_NEAR_AUTH = false`; the `/gittoken` endpoint the comment refers to **does not exist yet** |
| `wasmaudioworklet/functions/nearai/[[path]].js` | server API key, model allowlist, server-side system prompt + tools, origin allowlist, 300 kB conversation cap. No auth, no payment |
| `wasmaudioworklet/studio-agent/nearai-core.js` | already sends `Authorization: Bearer <apiKey>` when given one — **the BYO-key hook is already there** |

Note the current login adds a **function-call** access key (`push` on the git
contract, 0.25 N allowance). That key can sign NEP-413 (the gitproxy check was
deliberately relaxed to `view_access_key_list` rather than FullAccess-only) but
it **cannot** pay via x402 `exact`. Payments must go through the connected
wallet, not the stored app key.

---

## 2. Target architecture

Three access tiers, all gated by the same identity (a NEAR account id):

```
                     ┌──────────────── browser app ────────────────┐
                     │   near-connect wallet (user's own account)   │
                     │    accountId, signMessage, signDelegate      │
                     └───┬──────────────────┬──────────────────┬────┘
       NEP-413 token     │      sk- key     │   PAYMENT-SIGNATURE
     (X-Near-Auth)       │  (own credits)   │      (x402)
                         ▼                  ▼                  ▼
        ┌────────────────────────────────────────────────────────────┐
        │  Cloudflare Pages Functions (same origin, no persistence)  │
        │   /gitproxy/*   /nearai/*   /pay   (+ shared _x402.js)     │
        └───┬──────────────────┬────────────────────┬───────────────┘
            │                  │                    │
      git host (BYO PAT)  cloud-api.near.ai   x402 facilitator
                                                 (NEAR relayer)
```

**No free AI, and no bring-your-own key** (decided 2026-08-02). There is **one**
AI tier: you pay, and it runs on our credits with our key. The app itself stays
free — composing, compiling, playing, shaders, git storage — but *AI assistance*
is never on our budget for free. The current server-key-for-everyone behaviour is
therefore a thing to **remove**, not a tier to keep.

Two options considered and dropped, recorded so they are not re-litigated:

- **A free tier.** Costs: no audition funnel — nobody tries the agent before
  paying. Buys: no free-tier abuse surface, no §4.2(ix) exposure, no unbounded
  key creation on our org (§5.12), and a much simpler proxy.
- **Bring-your-own NEAR AI key** (user logs in to NEAR AI with the same NEAR
  account and spends their own credits, §1.2). It would have cost us nothing to
  relay, but it means a second enforcement policy, a second code path, and a
  security-critical mode switch — for users who by definition already have a
  NEAR AI account and could use it directly. **Not worth two code paths for the
  smallest audience.** §1.2's research stands if it is ever wanted back; the
  proxy already forwards a client-supplied `Authorization` if re-enabled.

**One key, one gate, one code path.** Because every request runs on our credits
under our organization's name, our prompt, tool set and model allowlist stay
**enforced** — there is no longer any "whoever pays sets the rules" tension to
resolve, because we always pay.

**The paid tier.** `402 Payment Required` → USDC on NEAR via a signed delegate
action → facilitator settles → we grant access. Designed in §5 — and per §5.11 what is being sold is
*access to our application*, never AI access itself. Two ways to represent
"access", and they suit the two proxies differently:

- **gitproxy → a stateless time-boxed pass.** A payment mints an HS256 JWT
  (`{sub: accountId, exp}`) using the `jwtSign`/`jwtVerify` already in
  `functions/gitproxy/[[path]].js`. No Cloudflare KV/D1 needed — the proxy
  stays stateless, which was the original design constraint.
- **AI proxy → top up the user's NEAR AI spend limit.** A settled payment
  `PATCH`es `spendLimit += paid amount` on a per-user API key named after their
  account id. **NEAR AI does the metering** — we never count tokens, never store
  balances. This is the piece that makes per-token billing possible without
  giving the proxy a database.

---

## 3. Phased plan

Each phase is a PR-sized change with its own tests, in dependency order.

### Phase 1 — mainnet *and* testnet, end to end — **BUILT**
*No new dependencies. Pure plumbing; unblocks everything else.*

New shared module **`wasmaudioworklet/near/network.js`** — one source of truth,
no DOM and no Node built-ins, so the browser, the module service worker and the
Cloudflare Pages Functions all import the same file.

- **The network is derived from the account id**, which is what
  `near-git-sw.js` had always done privately: `…​.near` → mainnet, `.testnet` /
  `.test.near` → testnet, `.sandbox` → the local docker RPC proxy. Only
  genuinely ambiguous ids (64-hex implicit accounts) take an explicit fallback.
- `nearacl.js` no longer pins testnet: `initNear()` resolves the network from
  the repo contract id, exposes it via `getNetworkId()`, and `login()` passes it
  to `login.html`.
- `login.html` derives the network the same way (`?network=` only breaks ties)
  and maps it to a wallet network — the sandbox has no wallet, so it borrows
  testnet's.
- `near-git-sw.js` uses the shared helper. Mainnet git now reads from
  `archival-rpc.mainnet.fastnear.com` instead of the legacy, rate-limited
  `rpc.mainnet.near.org` — matching what testnet already did, and archival
  because git packs live in blocks a regular node may have pruned.
- gitproxy: `NEAR_RPC` / `NFT_CONTRACT` constants replaced by `authConfig(env)`
  — `NEAR_NETWORK`, `NFT_CONTRACT`, `NEAR_RPC_URL`, `NEAR_AUTH_RECIPIENT`, all
  defaulting to today's mainnet behaviour. The key-on-account and NFT-ownership
  checks share **one** network setting on purpose: split them and
  "alice.testnet owns the mainnet NFT" would pass. The RPC caches are now keyed
  by network as well, so the same account id on two networks can't collide.
- 22 new `node --test` cases (`near/network.test.mjs` + gitproxy auth-config
  cases), wired into `npm run test-gitproxy`.

**Design change from the original plan:** the stored key is *not* namespaced
`near-git-key:<network>:<contractId>`. Once the network is derived from the
contract id, `repo.x.testnet` and `repo.x.near` are already distinct keys — the
mismatch that namespacing was meant to prevent cannot occur. Adding it would
only invalidate every key already stored and break the e2e helper, for no gain.

**Not resolved here:** whether the app should ever *offer* a network choice in
the UI. Today it follows the repo, which is the honest behaviour.

### Phase 2 — wallet signing: NEP-413 now, delegate actions next
*The one signing seam the later phases all reach through.*

With passkeys out (§1.1) there is exactly **one** auth provider —
`@hot-labs/near-connect` — so this is a small module, **not** a provider
framework. Speculative pluggability for a second provider that isn't coming
would be dead weight; if option (B) or (C) ever unblocks, generalise then.

- New `wasmaudioworklet/near/auth.js`, wrapping what `login.html` already does:
  `{ networkId, accountId, signMessage(payload), signDelegateActions(...) }`.
  It exists because *three* callers need a signature (the gitproxy gate, NEAR
  AI login, x402) and none of them should own wallet-connection code.
- Implement the client half of the gate the proxy has been waiting for: sign
  the NEP-413 payload, base64 the token, pass it from the main thread into the
  service worker's XHR override as `X-Near-Auth` (the same route the GitHub PAT
  already takes).
- Only then flip `REQUIRE_NEAR_AUTH` — behind config, off by default until the
  gate is proven against the deployed preview.
- Onboarding copy: since users now bring their own account, the logged-out
  state has to *say* so, and link to a wallet — for the network the open repo
  is on. This is the whole cost of skipping passkeys; make it a good sentence
  rather than a dead "Login" button.

### Phase 3 — ~~NEAR AI: bring your own account~~ — **DROPPED 2026-08-02**

Bring-your-own-key is not being built (§2). The research behind it (§1.2 — the
`POST /v1/auth/near` contract, staking-for-credits endpoints, per-key spend
limits) stays in this document because §5.7 reuses the same management API to
back a pass with a spend cap.

One item survives and is worth doing regardless, as it is a one-line ask with
no code: **open an issue on `nearai/cloud-api` requesting our origin in
`CORS_ALLOWED_ORIGINS`** (§1.2). It would not change the paid design — our key
must stay server-side either way — but it removes a needless hop on localhost
parity and future-proofs a direct path.

### Phase 4 — x402 gateway on the git proxy (testnet first)
*Smaller blast radius than the AI proxy, and the JWT primitives already exist.*

- New shared module `wasmaudioworklet/functions/_x402.js`:
  build `PAYMENT-REQUIRED`; call facilitator `/verify` + `/settle`; mint and
  verify the pass JWT. Move `jwtSign`/`jwtVerify` out of the gitproxy into it.
- gitproxy: no pass → `402` with `accepts[]` for `near:testnet` USDC; with a
  valid `PAYMENT-SIGNATURE` → verify, settle, serve, return `PAYMENT-RESPONSE`
  and the pass.
- Client: build the delegate action (one `ft_transfer`, 1 yoctoNEAR,
  `max_block_height = current + maxTimeoutSeconds`), sign via
  `wallet.signDelegateActions`, borsh+base64, retry.
- Facilitator: **x402.org on testnet**, then `x402.mikedotexe.com` for mainnet
  USDC. Keep the facilitator URL configurable so self-hosting stays open.
- Tests: node:test with a mocked facilitator, mirroring the existing 15
  gitproxy cases — 402 shape, header round-trip, expired/replayed pass,
  facilitator rejection, settle failure.
- **Verify first**: that the wallets we care about actually implement
  `signDelegateActions` with a full-access key. If a wallet doesn't, fall back
  to a plain `ft_transfer` transaction whose hash we verify on-chain before
  minting the pass (non-standard, but works everywhere).

### Phase 5 — paywall the AI feature

*The tier where we sell. Full design, terms analysis and cost controls in §5;
build order in §5.10.*

- Three-branch gate on `functions/nearai/[[path]].js`: valid pass → our key;
  valid user NEAR AI key → passthrough; neither → `402`.
- Pass = stateless HS256 JWT bound to the NEAR account id, bought with x402.
- Remove the free-for-everyone behaviour **last**, once the paid path works.
- Pricing decision lives here — priced in *our* units (hours of studio AI),
  never in NEAR AI tokens (§5.11).

### Phase 6 — prompt modes + model bench + example-prompt library

*Product quality work, designed in §6. Independent of the payment code, and the
bench should run **before** the price goes live so the $3 promise is backed.*

- Split `studio-agent/prompt.js` into a `PROMPTS` registry; proxy selects by
  client-sent `mode` id, appends the immutable guard clause last (§6.2).
- Trim each mode's prompt and tool list — a direct cost cut, since the prefix
  dominates (§5.5).
- Generalise `e2e/studio-agent-nearai-live.spec.js` into a (model × task)
  runner with objective checks and `usage`-derived cost (§6.3).
- Write the tasks as **real user prompts**, ship the passing ones as the app's
  starter library, and re-run them in CI replay mode as regression tests
  (§6.4).

### Not planned — passkey login

**Dropped 2026-08-02.** Users bring their own NEAR account. Reasons and the
specific unblocking condition for each of the three routes are in §1.1. Nothing
in Phases 2–5 depends on this, and none of them needs to be built differently
because of it — which is the point of dropping it now rather than later.

Worth watching, in rough order of likelihood:
`@near-wallet-selector/webauthn-wallet` moving to the WebAuthn PRF extension ·
an approved mainnet Auth0 client id for NEAR Auth · NEP-635 leaving Draft plus
an audit of the intents wallet contract.

---

## 4. Open decisions

**Settled**

1. ~~Default network~~ — Phase 1: derived per-feature from the account id. Git
   storage follows the repo's contract; the NFT gate stays on mainnet and is
   overridable per deployment.
2. ~~Facilitator~~ — hosted, URL configurable.
3. ~~Passkeys~~ — not now; users bring their own NEAR account (§1.1).
4. ~~Free AI tier?~~ — none. Removing the current server-key-for-everyone path
   is work to do, not just a policy (§2).
5. ~~Bring-your-own NEAR AI key?~~ — dropped. One key, one gate, one code path
   (§2).
6. ~~Do NEAR AI's terms allow this?~~ — yes, as a **Customer Application**, not
   as resale (§5.11). Constraints that follow: never hand over a key, don't
   price in AI units, write an End User Agreement, keep passes short-lived so
   access can be terminated.
7. ~~Price~~ — **$3 USDC for a 24 h day pass**, backed by a **$0.50**
   inference cap (§5.8). Slot length and cap still to be confirmed against
   measurement.
8. ~~Client-supplied system prompts?~~ — no. Server owns a **prompt registry**;
   the client picks a mode id and may pass structured context, never free-text
   instructions (§6.2).

**Still open**

9. **Ship the spend cap in v1, or caps + rate limit only?** §5.7 has both. The
   deciding number is the 95th-percentile turn cost once measured — mean is
   not the number that matters for a flat pass.
10. **Does the NFT gate survive?** `webassemblymusic.near` NFT ownership could
   become "the NFT is a lifetime pass" rather than the only way in.
11. **How hard does onboarding bite?** "Get a NEAR wallet, then pay" is now the
   whole front door, with no free taste of the agent behind it. §6.4's measured
   example prompts are the mitigation — the audition now happens *after*
   payment, so it has to work first time. If the funnel loss still shows up,
   that is the signal to revisit §1.1 and §2 — not a reason to pre-build.
12. **Write the End User Agreement** (§5.11 point 3). Required by NEAR AI's
   §6.1, and a prerequisite to charging anyone.
13. **Which model, and one default or per-mode?** Answered by the §6.3 bench,
   which should run before the price goes live.

## 5. Selling the AI feature inside the app

Scope, decided 2026-08-02: **the AI feature is sold as part of WebAssembly
Music, never as a standalone commodity, and never given away free.** That is
exactly the "Customer Application" shape §5.11 shows the terms permit — and it
makes the design dramatically simpler than the reseller architecture drafted
earlier.

### 5.1 The user never authenticates to the AI API — and must not

This is the whole answer to "how does the user authenticate to the AI API":
**they don't.** NEAR AI only ever sees one customer — us. Handing a user a
credential would be a "transfer … of the Services" under §4.2(x) *and* would
turn the feature into the commodity we are choosing not to sell.

The user authenticates **to our proxy**, with two separate things:

| | What it proves | How |
|---|---|---|
| **Identity** | which NEAR account you are | NEP-413 signature — the same machinery already written for the gitproxy gate |
| **Entitlement** | you have paid | a short-lived pass token our proxy issued after settlement |

```
Browser ── NEP-413 (who) + pass (paid) ──▶  /nearai/*  Pages Function
                                             │  verifies pass  → else 402
                                             │  enforces prompt / tools / model
                                             │  attaches OUR key (CF secret)
                                             ▼
                                       cloud-api.near.ai
                                    (sees one customer: us)
```

### 5.2 Using our own credits — the setup

One-off, in the NEAR AI dashboard; nothing at runtime:

1. **Fund the org** — card, or a **Staking Subscription**: stake NEAR and get
   "Usage Credits made available as a function of the amount of Staked NEAR"
   (§10.8, Appendix A/B). Explicitly blessed by the terms, and it keeps the
   funding NEAR-native.
2. **Create one workspace API key** for the app — and give *that key* a
   `spendLimit` (§1.2). It costs nothing and acts as a **circuit breaker**: a
   bug or an abuse spike can burn at most that much before NEAR AI starts
   returning `402` (verified hard-enforced in `middleware/usage.rs`).
3. **Store it as the `NEARAI_API_KEY` Cloudflare secret** — which is *already*
   how `functions/nearai/[[path]].js` works today.

That's it. **Using your own credits needs no code at all** — the proxy already
does it. What is missing is only the paywall.

### 5.3 Ensuring the user is paying

The proxy today attaches the server key to *anyone* on an allowed origin. The
change is one gate at the top — and since BYO-key is dropped (2026-08-02),
it has exactly **two** branches:

```
valid pass → serve on our key, with our prompt/tools/models
otherwise  → 402 Payment Required + PAYMENT-REQUIRED header
```

No third branch, no fallback. A request that proves nothing is a `402`, never a
quiet downgrade onto our budget. One key, one gate, one code path.

**The pass is a stateless HS256 JWT** — `{ sub: <accountId>, exp }` — signed
with a CF secret, using the `jwtSign`/`jwtVerify` already written and tested in
the gitproxy. No KV, no D1, no per-user rows.

**Bind it to the account, and require the NEP-413 token alongside it.** A pass
alone is a bearer token: paste it into a script, share the link, and someone
else spends our credits. Requiring a *fresh* NEP-413 signature for the same
`sub` means sharing the pass also means sharing a wallet signature that expires
hourly. The client caches the signature (~50 min) so the wallet is not prompted
per request — the pattern already proven in `Ariz-Portfolio`. If we want to
ship the simplest thing first, the pass alone works; add the binding before the
price is worth stealing.

### 5.4 Buying a pass (x402)

1. Any un-passed request → `402` with `PAYMENT-REQUIRED`: USDC on NEAR
   (`near:mainnet`), the price, our payee account (§1.3).
2. The wallet signs a NEP-366 delegate action — one `ft_transfer`, gas
   sponsored by the facilitator, so **the user needs no NEAR**.
3. We call the facilitator `verify` then `settle`.
4. On success: mint the pass, return it with `PAYMENT-RESPONSE`, and replay the
   original request so the purchase is invisible mid-conversation.

**Sell time, not tokens.** A pass grants "the AI feature in the studio for N
hours" — priced in our units, never in NEAR AI tokens or dollars-of-inference.
That is both the simpler engineering (no per-user metering, no state) and the
thing §5.11 requires: pricing in their units is what makes an arrangement look
like resale.

### 5.5 What a turn actually costs — measured, not guessed

Live pricing from `GET /v1/model/list` (nano-USD per token, 2026-08-02) for the
models the proxy allowlists, plus the fixed cost the app adds to every request.

| model | in $/M | out $/M | **cache-read $/M** | context | verifiable |
|---|---|---|---|---|---|
| `openai/gpt-oss-120b` | 0.15 | 0.55 | 0.03 | 131k | yes |
| `deepseek-ai/DeepSeek-V4-Flash` | 0.17 | 0.35 | 0.035 | 1M | yes |
| `Qwen/Qwen3.5-122B-A10B` **(current default)** | 0.40 | 3.20 | 0.08 | 262k | yes |
| `moonshotai/kimi-k2.6` | 0.81 | 3.85 | 0.41 | 262k | yes |
| `zai-org/GLM-5.1-FP8` | 1.40 | 4.40 | 0.26 | 203k | yes |

**The app's fixed prefix is ~11,600 tokens on every single request** —
`SYSTEM_PROMPT` (36 kB ≈ 9,100 tok) + the tool schemas (10 kB ≈ 2,500 tok) —
and `runAgentTurn` re-sends the whole conversation up to **25 times per turn**.
That, not the user's typing, is the cost driver.

**Prompt caching rescues most of it, and it is already working.** NEAR AI caches
prefixes *automatically* on TEE-hosted models — no API change — billing cached
input at the cache-read rate and reporting `usage.prompt_tokens_details
.cached_tokens` on every response. Our system prompt goes first and the tool
list is stable, so the prefix qualifies. Better still, inside an agent loop each
iteration's prompt is a *prefix of the next*, so nearly all of it is a cache hit.

Modelled turn — 6 model iterations, conversation growing to ~8k tokens, ~3k
output (≈19.6k full-price new tokens, ≈75k cached):

| model | cost per turn |
|---|---|
| `gpt-oss-120b` | **$0.0069** |
| `DeepSeek-V4-Flash` | **$0.0070** |
| `Qwen3.5-122B-A10B` (current default) | **$0.0235** |

→ **Switching the default off Qwen3.5 is a ~3.4× cost cut** for the same work.
Worth re-running the 5-model shader bench on this axis before choosing.

### 5.6 The caps that don't exist yet — fix these first

Today's worst case is bad: `MAX_MESSAGES_CHARS` is **300,000 chars ≈ 75,000
tokens**, and **`max_tokens` is never set** on the upstream request. A single
turn at the cap can therefore cost on the order of **$1**. The controls are
cheap and all live in `functions/nearai/[[path]].js`:

1. **Set `max_tokens`** (~2,000). Output is the expensive side — 8× input on
   Qwen, 3.7× on gpt-oss — and it is currently unbounded.
2. **Cut `MAX_MESSAGES_CHARS`** from 300k to ~60k chars (~15k tokens). Its own
   comment says the app's turns "stay far below this"; it is a safety cap set
   5× too loose.
3. **Change the default model** (above).
4. **A Cloudflare rate-limit rule** on `/nearai/*`, keyed on the pass subject.

With (1)+(2)+(3), max cost per request ≈ **$0.005**. At 10 requests/min that is
~$3/hour worst case against ~$0.07/hour typical — a **40× gap**. That gap is
the whole problem with flat-rate time, and rate limiting alone does not close
it.

### 5.7 Closing the gap: back the time pass with a spend cap

**Recommended.** Keep *time* as the product, and make the spend bound an
invisible safety net rather than the thing being sold (§5.11 requires exactly
that — never price in AI units).

Mechanism, still only ever *our* credits and *our* org:

- One NEAR AI api-key **per customer account id**, in our `customers`
  workspace. It is not the customer's key — they never see it; it is an
  internal meter.
- Each purchase does `PATCH .../spend-limit += <the pass's inference budget>`.
- NEAR AI enforces it (verified: `middleware/usage.rs` admits only while
  `spend < limit`, else `402 api_key_limit_exceeded`).
- The key is carried inside the pass token **encrypted to a CF secret**
  (AES-GCM via `crypto.subtle`), so it is usable only inside our Worker. No KV,
  no D1, no per-user rows.

Cost is then bounded *exactly* by what was paid, not statistically. A customer
who burns the cap early hits `402` and buys another pass — and that is a
customer worth having.

Cost of the mechanism: two management calls per **purchase** (not per request)
— a NEP-413 sign-in as ourselves to mint a session, then the `PATCH`. Nothing
persists between them, and per-account keys mean no cleanup of expired ones.

**Simpler v1, if you want to ship sooner:** pass + caps + rate limit only, and
watch `GET /v1/organizations/{org}/usage/balance`. Accept a bounded worst case
per pass and add the spend cap when volume justifies it. The pass format should
carry a version field from day one so adding the encrypted key later is not a
breaking change.

### 5.8 Price and slot length

**Price decided 2026-08-02: $3 for a 24 h day pass.** The rest is a starting
point to be replaced by measurement (below):

| | value | why |
|---|---|---|
| Slot | **24 h day pass** | An hour is too short for a music session and puts a wallet popup in the middle of creative flow. A day is the natural unit for a tool people dip in and out of. |
| Inference budget behind it | **$0.50** | ~70 turns on gpt-oss-120b; far beyond typical use, so it binds only on abuse. |
| Price | **$3 USDC** *(decided)* | Normal indie-tool price point. ~20× typical cost, ≥6× the worst case. |
| Extras | 7-day and 30-day passes | Same mechanism, better value, fewer signatures. |

Sell "a day in the studio with the AI", not "$X of inference". Pricing in our
own units is both the simpler product and what §5.11 requires.

**Then measure and reprice.** Every response carries `usage` with
`prompt_tokens`, `cached_tokens` and `completion_tokens`. Log *aggregate*
cost-per-turn (not per user) for a week of real use, and set the price from the
observed distribution rather than this model. Two things to watch: the actual
cache-hit ratio, and the tail — the 95th-percentile turn matters far more than
the mean for whether a flat pass is safe.
### 5.9 What this design *deletes*

Worth stating, because the earlier draft carried real complexity that this
scope removes outright:

- **No per-user NEAR AI API keys.** They existed to make NEAR AI meter each
  customer. A time pass has no per-user balance to protect.
- **No provisioning endpoint, no merchant NEP-413 login at runtime**, and so
  **the single-use refresh-token problem is moot** — we never touch the
  management API in the request path. The app key is created once, by hand.
- **No encrypted capability** wrapping an `sk-` key, because no key ever goes
  near the browser.
- **No key-recovery flow** (list → delete → recreate with the unspent
  remainder).

If usage-based pricing is ever wanted, per-user keys with `spendLimit` are the
way back to it — §1.2 has the endpoints and NEAR AI's own `402` on exhaustion
is the natural top-up trigger. Don't build it until the pricing needs it.

### 5.10 Build order

Fits Phase 5 as a small delta on code that already exists:

1. Move `jwtSign`/`jwtVerify` into the shared `functions/_x402.js` (Phase 4).
2. Add the three-branch gate to `functions/nearai/[[path]].js` + the `402`
   response shape. Tests: pass valid / expired / wrong-secret / tampered `sub`;
   **and an explicit test that no-credentials never reaches the server key.**
3. Wire the client: on `402`, prompt to buy, sign the delegate, retry.
4. Only then remove the current free-for-everyone behaviour, so the paid path
   is proven before the free one goes away.
### 5.11 What NEAR AI's terms actually allow — **checked 2026-08-02**

The docs repo has no licence or terms (its README links a `LICENSE` file that
doesn't exist, and that would cover the docs site anyway). The real documents
are linked from `cloud.near.ai`:

- **Terms of Service** — <https://near.ai/terms-of-service>
- **Acceptable Use Policy** — <https://near.ai/acceptable-use-policy>
- (`cloud.near.ai` also links `near.ai/terms-and-policies/near-ai-cloud-terms-of-service`, which **404s** — the two above are the live ones.)

Counterparty is **Jasnah, Inc. d/b/a NEAR AI**. The Services expressly include
"the NEAR AI Cloud API".

**The answer is a permitted/prohibited pair, and the whole design hangs on it.**

> **§4.1** "Customer may use the Services to (i) generate Outputs based on its
> Inputs … and **(ii) make the Services available to its End Users as
> integrated into or through the Customer Application**."

> **§4.2 Use Restrictions** "Customer will not: … **(x) sell, resell,
> sublicense, transfer, or distribute any or all of the Services**;"

> **§5.2 Authorized Users** "Only Customer's Authorized Users may access and use
> the Services, provided, that (i) **End Users may only access the Services
> through the Customer Application** …"

So: **you may charge for your application, which has AI inside it. You may not
sell AI access as a commodity.** A "Customer Application" is defined as
"Customer's applications, products or services in which Customer may integrate
the Services" — WebAssembly Music is squarely that.

**Four consequences that change the build:**

1. **No customer ever receives a NEAR AI credential.** Handing someone a
   working key is the plain meaning of "transfer … the Services" under
   §4.2(x), and it breaks §5.2's "only through the Customer Application". The
   design in §5.1 satisfies this by construction: the only key is ours, it
   lives in a Cloudflare secret, and the user authenticates to *our proxy*
   instead. (Note this also rules out the earlier reseller sketch — per-user
   keys handed out as encrypted capabilities — which §5.9 drops for
   independent reasons.)
2. **Do not price in AI units.** Sell app access — a time-boxed studio pass, or
   credits denominated in *our* units — not "N tokens of NEAR AI". Pricing in
   their units is what makes an arrangement look like resale. This is a real
   constraint on the pricing decision, not a cosmetic one.
3. **We must have an End User Agreement.** §6.1: "Customer will … (b) **ensure
   End Users enter into an End User Agreement** and terminate access to the
   Services for any [End User in breach]". The definition requires it to carry
   "the obligations, restrictions, and limitations (**including those in the
   AUP**) applicable to End Users under these Terms." **This is a deliverable**,
   not a footnote: app terms that incorporate NEAR AI's AUP by reference.
4. **"Terminate access for any End User in breach" collides with statelessness.**
   A pure signed-capability token cannot be revoked before it expires. Either
   keep capability/pass lifetimes short (hours, not weeks) so termination is
   achievable by simply not reissuing, or add a small revocation store. Decide
   this when building §5.3/§5.7 — it is the one place the zero-persistence design
   has a genuine contractual cost.

**We are also on the hook for our users:** §5.2 — "Any act or omission that if
committed by Customer would constitute a breach of these Terms will be deemed
to constitute a breach … if committed by Customer's Authorized Users." That is
the strongest argument for keeping the music-focused system prompt, tool set
and model allowlist **enforced** on this tier (§2's *whoever pays sets the
rules*).

Other restrictions worth knowing before building: **(ii)** don't use the
Services to develop a competing product or AI model; **(vii)** don't use
Outputs to train competing models; **(v)** no programmatic extraction outside
the published APIs and rate limits; **(ix)** free-tier resources may not be used
"for workloads earning third-party financial rewards". From the **AUP**: don't
"share login credentials" and don't "create multiple accounts to bypass usage
caps, free-tier quotas, or other service thresholds".

**Funding the org by staking is explicitly contemplated**: a *Staking
Subscription* routes staking rewards to NEAR AI with "Usage Credits made
available as a function of the amount of Staked NEAR" (§10.8, Appendix A;
Appendix B covers Cloud Staking, with credit-exhaustion consequences in §B.7).
"Usage Credits" are defined as "the prepaid units for metered use of the
Services that Customer may purchase on the Website."

> **This is a careful reading of the text, not legal advice.** §4.1(ii) versus
> §4.2(x) is exactly the kind of boundary where the counterparty's own
> interpretation governs. Before charging real money, confirm the model with
> NEAR AI in writing — "we charge for our app; inference runs on our account;
> users never receive credentials" — and have a lawyer look at the End User
> Agreement.

### 5.12 Remaining risks that are not engineering problems

1. **You become the merchant of record**: revenue recognition, VAT/tax, refunds
   and consumer-protection duties, all jurisdiction-dependent.
2. **Prepaid balances are money you owe.** Keep them small; `expires_at` on the
   api-key can time-box them (say so up front if you use it).
3. **Provisioning is a spam surface** — one api-key per NEP-413 identity means
   anyone minting NEAR accounts can create rows on your org. With no free tier
   (§2) this is much smaller: a key is only created once a payment settles.

## 6. Model choice and prompt architecture

### 6.1 What actually stops abuse (the prompt mostly doesn't)

Worth being precise, because it decides how much the prompt design has to carry.

A system prompt is **not** a security boundary. The user already types arbitrary
text as user messages, and any instruction can be countermanded by a later one
("ignore previous instructions"). What genuinely bounds abuse is:

- **the tool set is server-chosen** — the client cannot add tools, so the model
  can only act through our registry;
- **the model allowlist** — no reaching past the cheap TEE models;
- **`max_tokens` + conversation-size caps** (§5.6) — bounded cost per request;
- **the rate limit**, and above all
- **a paid pass bound to a NEAR account** — abuse costs the abuser money and is
  attributable to an account.

So what *is* the prompt for? Two things that matter anyway:

1. **Product quality** — the assistant is good at this app's tasks.
2. **ToS liability** — NEAR AI's §5.2 makes us responsible for what our End
   Users generate on our organization. Keeping outputs music-focused genuinely
   reduces that exposure, which is a real reason to keep a server-side guard
   even though it is porous.

### 6.2 Server owns the prompts; the client picks a mode

Different use cases want different prompts, but a free-text client prompt is an
instruction channel we cannot take back. The registry pattern gives the
flexibility without the channel:

- `studio-agent/prompt.js` grows from one `SYSTEM_PROMPT` to
  `PROMPTS = { studio, song, synth, faust, shader }`. The proxy already imports
  that module, so it stays a single source of truth deployed with the app.
- The client sends a **mode id** (`{ mode: 'shader' }`). The server looks it up;
  unknown or missing → the default. Client `system` messages stay stripped,
  exactly as today.
- An **immutable guard clause is appended after** the selected prompt — scope to
  this app, decline unrelated work. Server-owned, and last, so recency works
  for us rather than against us.
- The client may pass **structured context, not instructions** — e.g.
  `{ mode, context: { openFile, selection } }` — interpolated into a
  server-owned template and size-capped. Data, not directives.

*Rejected:* server preamble + free-text client suffix. It reads as flexible but
hands the client an instruction channel, and later instructions can countermand
earlier ones. The registry costs a deploy per new mode, which is the right
trade when modes change rarely.

**Modes are also a cost lever, not just a quality one.** Today every request
carries the whole ~11,600-token prefix regardless of task (§5.5) — a shader
question ships the Faust and sequencer sections *and* their tool schemas. A
shader mode needs neither. Since that prefix is the dominant cost, trimming
per mode cuts the bill directly, and a shorter tool list also measurably
improves tool-choice accuracy. Expect mode-specific prompts to pay for
themselves twice.

### 6.3 Choosing the model — a task-matrix bench

Prior work benched 5 models on **one** shader fix (4/5 viable), and an audio
bench was planned on the same single-task shape. Committing to a default model
for a paid product needs the matrix: this app has genuinely different workloads
and a model can be fine at one and useless at another.

**The harness already exists.** `e2e/studio-agent-nearai-live.spec.js` is a
record/replay harness that drives the *real* app with a *real* model, executes
the real tools, and already takes the model from `NEARAI_MODEL`. The work is
generalising it into a runner over (model × task), not building it.

**Tasks — each with a machine-checkable result.** The lesson from the audio
bench plan holds: **no human judging.** Silence, blank frames and compile
errors are all objectively detectable.

| task | objective pass/fail |
|---|---|
| Song / sequence edit (JS) | compiles in the QuickJS sandbox; expected note events present |
| Synth instrument (AssemblyScript) | `asc` compiles; `audioprobe` shows non-silent output at the expected pitch |
| Faust instrument | `faust2as` transpiles, compiles, and sounds |
| Effect (channel or master) | compiles; output differs from dry (impulse response) |
| Shader fix | `tools/shadertest/render.mjs` compiles and renders a non-blank frame |
| Debug a broken build | a compile error is present before and gone after |

**Per cell, record:** pass/fail, turns to success, tokens in/out/**cached**,
**cost from `usage`**, wall-clock.

**Score on pass rate first, then cost per *successful* task.** A model that is
3.4× cheaper but fails half the tasks is more expensive, not less — cost per
attempt is the wrong denominator.

**Run each cell ~3×.** These are stochastic; one run cannot tell a 60% model
from a 90% one, and picking a default off a single sample is how you ship the
wrong one.

**Candidates:** the five allowlisted TEE models (§5.5), plus
`google/gemma-4-31B-it` as a cheap verifiable wildcard ($0.13 / $0.40).

**Deliverables:** the `DEFAULT_MODEL` value, backed by a table — and possibly
**per-mode defaults**, which §6.2 makes natural: a cheap model for song edits,
a stronger one for Faust DSP. Re-run when prices or models change;
`/v1/model/list` is live and authoritative.

### 6.4 The bench corpus *is* the shipped example-prompt library

The tasks in §6.3 should be written as **prompts a real user would actually
type**, not synthetic harness inputs — because then one artifact does three
jobs:

1. **Picks the model** (§6.3).
2. **Ships in the app** as a starter list — "try one of these" per mode, one
   click to run.
3. **Guards against regressions** — the same prompts re-run in replay mode in
   CI whenever the prompt registry, tool schemas or default model change.

**With no free tier this is the onboarding.** A user pays $3 *before* seeing the
agent work even once, so their first session has to succeed. A list of prompts
we have measured as working is the difference between "this is great" and "I
paid for this?". It is the closest thing to the audition funnel we gave up
in §2 — the audition just happens *after* payment, so it has to be reliable.

**The promise has to be earned, not asserted.** Only ship a prompt in the
library if it passes on the chosen model in **at least 2 of 3 runs**. Anything
flakier is a demo, not a guarantee. Track the pass rate per prompt over time so
a model or prompt change that quietly breaks one shows up.

**Also record cost per example prompt.** It tells the user roughly how far a day
pass goes ("a full instrument ≈ a few cents"), and it validates §5.7's $0.50
budget and the $3 price against real tasks rather than a model. If a headline
example costs more than a few cents, either the example or the price is wrong.

Practical shape: keep the corpus as data — `{ id, mode, prompt, check }` — with
`check` the objective assertion from §6.3. The app reads `id`/`mode`/`prompt`
for the UI list; the bench runner and CI read `check` too.

## 7. Sources

- x402 NEAR `exact` scheme — <https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_near.md>
- `@x402/near` package — <https://github.com/x402-foundation/x402/tree/main/typescript/packages/mechanisms/near>
- x402 facilitator list — <https://github.com/x402-foundation/x402/blob/main/docs/dev-tools/facilitators.md>
- NEAR AI Cloud API — <https://github.com/nearai/cloud-api>, OpenAPI at <https://cloud-api.near.ai/api-docs/openapi.json>
- NEP-635 (P-256 host function) — <https://github.com/near/NEPs/blob/master/neps/nep-0635.md>
- NEAR Intents wallet contract — <https://github.com/near/intents/tree/main/contracts/wallet>
- NEAR Auth — <https://docs.auth.near.org> and <https://github.com/near/docs/blob/main/web3-apps/tutorials/near-auth.mdx>
- wallet-selector WebAuthn module — <https://github.com/near/wallet-selector/tree/main/packages/webauthn-wallet>
- near-connect — <https://github.com/azbang/near-connect>
- **NEAR AI Terms of Service** — <https://near.ai/terms-of-service> (Jasnah, Inc. d/b/a NEAR AI; §4.1, §4.2(x), §5.2, §6.1 are the operative ones)
- **NEAR AI Acceptable Use Policy** — <https://near.ai/acceptable-use-policy>
- NEAR AI docs — <https://github.com/nearai/docs> (no licence or terms in the repo; the `LICENSE` its README links does not exist)
- OutLayer — <https://outlayer.fastnear.com/docs/getting-started>, <https://github.com/fastnear/near-outlayer> (see `docs/PAYMENT_CHECKS.md`, `API.md`)
- near-pay (x402 + MPP client) — <https://github.com/Kampouse/near-pay>
