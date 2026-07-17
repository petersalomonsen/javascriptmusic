/**
 * NEAR Git Service Worker (stateless)
 *
 * Intercepts git smart HTTP requests and translates them to NEAR contract
 * calls. Contract ID is derived from the URL path, credentials from the
 * Authorization header, and RPC URL from the network (testnet/mainnet).
 *
 * URL format: /near-repo/<contractId>.git/<git-endpoint>
 * Auth header: Authorization: Bearer <JSON {accountId, publicKey, privateKey}>
 */

import init, {
    parse_packfile,
    build_packfile,
    build_packfile_with_bases,
    apply_delta,
    git_sha1,
    create_signed_transaction,
} from './wasm-lib/wasm_lib.js';

let wasmReady = false;

const wasmInit = init(new URL('./wasm-lib/wasm_lib_bg.wasm', self.location.origin));

async function ensureWasm() {
    if (!wasmReady) {
        await wasmInit;
        wasmReady = true;
    }
}

function extractContractId(path) {
    const match = path.match(/^\/near-repo\/([^/]+?)\.git\//);
    return match ? match[1] : null;
}

function extractAuth(request) {
    const auth = request.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) return null;
    try {
        return JSON.parse(auth.slice(7));
    } catch (e) {
        return null;
    }
}

function rpcUrlForContract(contractId) {
    // .sandbox is a non-real suffix used by the e2e harness; route to the
    // local docker sandbox RPC proxy so tests don't hit live networks.
    if (contractId.endsWith('.sandbox')) {
        return 'http://localhost:3030/near-rpc';
    }
    if (contractId.endsWith('.testnet') || contractId.endsWith('.test.near')) {
        return 'https://archival-rpc.testnet.fastnear.com';
    }
    return 'https://rpc.mainnet.near.org';
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (!url.pathname.startsWith('/near-repo/')) return;

    event.respondWith(
        handleGitRequest(event.request, url).catch(err => {
            console.error('[near-git-sw] error handling', url.pathname, err);
            return new Response('Service worker error: ' + err.message, { status: 500 });
        })
    );
});

async function handleGitRequest(request, url) {
    await ensureWasm();

    const path = url.pathname;
    const contractId = extractContractId(path);
    if (!contractId) {
        return new Response('Bad request: cannot extract contract ID', { status: 400 });
    }

    const rpcUrl = rpcUrlForContract(contractId);
    const auth = extractAuth(request); // null for read-only (clone/fetch)

    const ctx = { contractId, rpcUrl, auth };

    if (path.endsWith('/info/refs')) {
        return handleInfoRefs(ctx, url.searchParams.get('service'));
    }
    if (path.endsWith('/git-receive-pack')) {
        if (!auth) {
            return new Response('Authentication required for push', { status: 401 });
        }
        return handleReceivePack(ctx, new Uint8Array(await request.arrayBuffer()));
    }
    if (path.endsWith('/git-upload-pack')) {
        return handleUploadPack(ctx, new Uint8Array(await request.arrayBuffer()));
    }
    return new Response('Not found', { status: 404 });
}

// --- NEAR RPC ---

async function nearRpc(ctx, method, params) {
    const res = await fetch(ctx.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 'q', method, params }),
    });
    return res.json();
}

async function nearViewCall(ctx, method, args) {
    const json = await nearRpc(ctx, 'query', {
        request_type: 'call_function',
        finality: 'optimistic',
        account_id: ctx.contractId,
        method_name: method,
        args_base64: btoa(JSON.stringify(args)),
    });
    if (json.error) throw new Error(JSON.stringify(json.error));
    return JSON.parse(new TextDecoder().decode(new Uint8Array(json.result.result)));
}

async function nearViewCallBorsh(ctx, method, fromIndex) {
    const argBytes = new Uint8Array(4);
    new DataView(argBytes.buffer).setUint32(0, fromIndex, true);

    const json = await nearRpc(ctx, 'query', {
        request_type: 'call_function',
        finality: 'optimistic',
        account_id: ctx.contractId,
        method_name: method,
        args_base64: uint8ToBase64(argBytes),
    });
    if (json.error) throw new Error(JSON.stringify(json.error));

    const data = new Uint8Array(json.result.result);
    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let pos = 0;
    const count = view.getUint32(pos, true); pos += 4;
    const packs = [];
    for (let i = 0; i < count; i++) {
        const len = view.getUint32(pos, true); pos += 4;
        packs.push(data.slice(pos, pos + len));
        pos += len;
    }
    return packs;
}

function uint8ToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

// Highest nonce already used per access key. The optimistic-finality
// view_access_key query can return a stale nonce right after a recent
// transaction, and reusing it makes the RPC reject the tx with InvalidNonce
// (surfaced to git as a failed push).
const lastUsedNonces = {};

async function nearFunctionCall(ctx, method, args) {
    const { auth } = ctx;

    const accessKeyRes = await nearRpc(ctx, 'query', {
        request_type: 'view_access_key',
        finality: 'optimistic',
        account_id: auth.accountId,
        public_key: `ed25519:${auth.publicKey}`,
    });
    if (accessKeyRes.error) throw new Error(JSON.stringify(accessKeyRes.error));
    const nonceKey = `${auth.accountId}:${auth.publicKey}`;
    const nonce = Math.max(accessKeyRes.result.nonce, lastUsedNonces[nonceKey] || 0) + 1;
    lastUsedNonces[nonceKey] = nonce;
    const blockHash = accessKeyRes.result.block_hash;

    let argsBytes;
    if (method === 'push') {
        // Borsh-encode: Vec<u8> pack_data + Vec<RefUpdate> ref_updates
        const packData = Uint8Array.from(atob(args.pack_data), c => c.charCodeAt(0));
        const refUpdates = args.ref_updates || [];

        const parts = [];
        const packLen = new Uint8Array(4);
        new DataView(packLen.buffer).setUint32(0, packData.length, true);
        parts.push(packLen);
        parts.push(packData);

        const refLen = new Uint8Array(4);
        new DataView(refLen.buffer).setUint32(0, refUpdates.length, true);
        parts.push(refLen);
        for (const u of refUpdates) {
            const nameBytes = new TextEncoder().encode(u.name);
            const nameLen = new Uint8Array(4);
            new DataView(nameLen.buffer).setUint32(0, nameBytes.length, true);
            parts.push(nameLen);
            parts.push(nameBytes);
            if (u.old_sha) {
                parts.push(new Uint8Array([1]));
                const oldBytes = new TextEncoder().encode(u.old_sha);
                const oldLen = new Uint8Array(4);
                new DataView(oldLen.buffer).setUint32(0, oldBytes.length, true);
                parts.push(oldLen);
                parts.push(oldBytes);
            } else {
                parts.push(new Uint8Array([0]));
            }
            const newBytes = new TextEncoder().encode(u.new_sha);
            const newLen = new Uint8Array(4);
            new DataView(newLen.buffer).setUint32(0, newBytes.length, true);
            parts.push(newLen);
            parts.push(newBytes);
        }
        const totalLen = parts.reduce((s, p) => s + p.length, 0);
        argsBytes = new Uint8Array(totalLen);
        let offset = 0;
        for (const p of parts) { argsBytes.set(p, offset); offset += p.length; }
    } else {
        argsBytes = new TextEncoder().encode(JSON.stringify(args));
    }

    let txNonce = nonce;
    let broadcastRes;
    for (let attempt = 0; ; attempt++) {
        const signedTxBase64 = create_signed_transaction(
            auth.accountId,
            auth.publicKey,
            auth.privateKey,
            ctx.contractId,
            method,
            argsBytes,
            BigInt(txNonce),
            blockHash,
            BigInt(300_000_000_000_000), // 300 TGas
            '0',
        );

        broadcastRes = await nearRpc(ctx, 'broadcast_tx_commit', [signedTxBase64]);
        // The lastUsedNonces tracking only covers this SW instance — a tx sent
        // before the SW restarted can still make our nonce stale. The error
        // carries the chain's current nonce, so retry from there.
        const invalidNonce = broadcastRes.error?.data?.TxExecutionError?.InvalidTxError?.InvalidNonce;
        if (invalidNonce && attempt < 2) {
            txNonce = invalidNonce.ak_nonce + 1;
            lastUsedNonces[nonceKey] = txNonce;
            console.warn(`[near-git-sw] stale nonce, retrying with ${txNonce}`);
            continue;
        }
        break;
    }
    if (broadcastRes.error) {
        return { success: false, error: JSON.stringify(broadcastRes.error) };
    }
    const result = broadcastRes.result;
    if (result.status && result.status.SuccessValue !== undefined) {
        const rawBase64 = result.status.SuccessValue;
        let decoded = null;
        if (rawBase64 && method !== 'push') {
            const text = new TextDecoder().decode(Uint8Array.from(atob(rawBase64), c => c.charCodeAt(0)));
            decoded = text ? JSON.parse(text) : null;
        }
        return {
            success: true,
            result: decoded,
            txHash: result.transaction.hash,
        };
    }
    return {
        success: false,
        error: JSON.stringify(result.status),
        txHash: result.transaction?.hash,
    };
}

// --- pkt-line helpers ---

function pktLineEncode(data) {
    const len = data.length + 4;
    const hex = len.toString(16).padStart(4, '0');
    const prefix = new TextEncoder().encode(hex);
    const result = new Uint8Array(prefix.length + data.length);
    result.set(prefix);
    result.set(data, prefix.length);
    return result;
}

function pktLineFlush() { return new TextEncoder().encode('0000'); }

function pktLineEncodeString(str) {
    return pktLineEncode(new TextEncoder().encode(str));
}

function readPktLines(data) {
    const lines = [];
    let pos = 0;
    const decoder = new TextDecoder();
    while (pos + 4 <= data.length) {
        const lenHex = decoder.decode(data.slice(pos, pos + 4));
        const len = parseInt(lenHex, 16);
        if (len === 0) { pos += 4; break; }
        if (len < 4) break;
        lines.push(data.slice(pos + 4, pos + len));
        pos += len;
    }
    return { lines, rest: data.slice(pos) };
}

// --- Git protocol handlers ---

const ZERO_SHA = '0000000000000000000000000000000000000000';
const CAPABILITIES = 'report-status delete-refs';

async function handleInfoRefs(ctx, service) {
    const refs = await nearViewCall(ctx, 'get_refs', {});
    const parts = [];
    parts.push(pktLineEncodeString(`# service=${service}\n`));
    parts.push(pktLineFlush());

    if (refs.length === 0) {
        parts.push(pktLineEncodeString(`${ZERO_SHA} capabilities^{}\0${CAPABILITIES}\n`));
    } else {
        const headEntry = refs.find(([name]) => name === 'refs/heads/main')
            || refs.find(([name]) => name === 'refs/heads/master')
            || refs[0];
        const [headRef, headSha] = headEntry;
        const caps = `${CAPABILITIES} symref=HEAD:${headRef}`;
        parts.push(pktLineEncodeString(`${headSha} HEAD\0${caps}\n`));
        for (const [refName, sha] of refs) {
            parts.push(pktLineEncodeString(`${sha} ${refName}\n`));
        }
    }
    parts.push(pktLineFlush());

    return new Response(concatUint8Arrays(parts), {
        headers: { 'Content-Type': `application/x-${service}-advertisement` },
    });
}

async function handleReceivePack(ctx, body) {
    const { lines, rest } = readPktLines(body);
    const decoder = new TextDecoder();

    const refUpdates = [];
    for (const line of lines) {
        const text = decoder.decode(line).trim();
        const parts = text.split(' ');
        if (parts.length >= 3) {
            const oldSha = parts[0].split('\0').pop();
            const newSha = parts[1];
            const refName = parts.slice(2).join(' ').split('\0')[0];
            // Skip no-op ref updates (nothing changed)
            if (oldSha === newSha) continue;
            refUpdates.push({
                name: refName,
                old_sha: oldSha === ZERO_SHA ? null : oldSha,
                new_sha: newSha,
            });
        }
    }

    if (rest.length > 0) {
        const parseJson = parse_packfile(rest);
        const parseResult = JSON.parse(parseJson);

        const newObjects = (parseResult.objects || []).map(obj => ({
            obj_type: obj.obj_type,
            data: obj.data,
        }));

        if (parseResult.deltas && parseResult.deltas.length > 0) {
            // Multi-pass + chain-aware (same reasoning as the upload-pack and
            // receive-pack/existing-packs paths).
            const localMap = {};
            for (const obj of newObjects) {
                const data = Uint8Array.from(atob(obj.data), c => c.charCodeAt(0));
                localMap[git_sha1(obj.obj_type, data)] = { obj_type: obj.obj_type, data };
            }
            const pending = parseResult.deltas.map(d => ({
                base_sha: d.base_sha,
                deltaData: Uint8Array.from(atob(d.delta_data), c => c.charCodeAt(0)),
                chain: (d.chain || []).map(c =>
                    Uint8Array.from(atob(c), ch => ch.charCodeAt(0))),
            }));
            let progress = true;
            while (progress && pending.length > 0) {
                progress = false;
                for (let i = pending.length - 1; i >= 0; i--) {
                    const delta = pending[i];
                    const base = localMap[delta.base_sha];
                    if (!base) continue;
                    let current = apply_delta(base.data, delta.deltaData);
                    for (const d of delta.chain) current = apply_delta(current, d);
                    const sha = git_sha1(base.obj_type, current);
                    if (!localMap[sha]) {
                        localMap[sha] = { obj_type: base.obj_type, data: current };
                        newObjects.push({ obj_type: base.obj_type, data: uint8ArrayToBase64(current) });
                    }
                    pending.splice(i, 1);
                    progress = true;
                }
            }
        }

        let packData;
        const packCount = await nearViewCall(ctx, 'get_pack_count', {});
        if (packCount > 0) {
            const existingPacks = await nearViewCallBorsh(ctx, 'get_packs', 0);
            // Walk every existing pack: collect bases into baseMap (sha → decoded
            // bytes + type), queue deltas for multi-pass resolution. Same
            // reasoning as the upload-pack handler — single-pass would silently
            // drop deltas whose base lives in a later pack.
            const baseObjects = [];
            const baseMap = {};
            const pendingDeltas = [];
            for (const packBytes of existingPacks) {
                const p = JSON.parse(parse_packfile(packBytes));
                for (const obj of (p.objects || [])) {
                    const data = Uint8Array.from(atob(obj.data), c => c.charCodeAt(0));
                    const sha = git_sha1(obj.obj_type, data);
                    if (!baseMap[sha]) {
                        baseMap[sha] = { obj_type: obj.obj_type, data };
                        baseObjects.push(obj);
                    }
                }
                if (p.deltas) {
                    for (const delta of p.deltas) {
                        pendingDeltas.push({
                            base_sha: delta.base_sha,
                            deltaData: Uint8Array.from(atob(delta.delta_data), c => c.charCodeAt(0)),
                            // chain: OFS_DELTAs stacked on top of an external
                            // REF_DELTA, applied in order after delta_data.
                            chain: (delta.chain || []).map(c =>
                                Uint8Array.from(atob(c), ch => ch.charCodeAt(0))),
                        });
                    }
                }
            }
            let progress = true;
            while (progress && pendingDeltas.length > 0) {
                progress = false;
                for (let i = pendingDeltas.length - 1; i >= 0; i--) {
                    const delta = pendingDeltas[i];
                    const base = baseMap[delta.base_sha];
                    if (!base) continue;
                    let current = apply_delta(base.data, delta.deltaData);
                    for (const d of delta.chain) current = apply_delta(current, d);
                    const sha = git_sha1(base.obj_type, current);
                    if (!baseMap[sha]) {
                        baseMap[sha] = { obj_type: base.obj_type, data: current };
                        baseObjects.push({ obj_type: base.obj_type, data: uint8ArrayToBase64(current) });
                    }
                    pendingDeltas.splice(i, 1);
                    progress = true;
                }
            }
            if (pendingDeltas.length > 0) {
                const orphans = pendingDeltas.map(d => d.base_sha);
                console.warn('[near-git-sw] push: unresolved bases',
                    orphans, '— filtered new-object set may overlap');
            }

            const filteredNew = newObjects.filter(obj => {
                const data = Uint8Array.from(atob(obj.data), c => c.charCodeAt(0));
                return !baseMap[git_sha1(obj.obj_type, data)];
            });

            console.log(`[near-git-sw] push: ${filteredNew.length} new objects, ${baseObjects.length} bases`);

            if (filteredNew.length === 0 && refUpdates.length === 0) {
                console.log('[near-git-sw] nothing to push, skipping contract call');
            } else {
                packData = build_packfile_with_bases(JSON.stringify(filteredNew), JSON.stringify(baseObjects));
            }
        } else {
            packData = build_packfile(JSON.stringify(newObjects));
        }

        if (packData) {
            const packB64 = uint8ArrayToBase64(packData);
            const pushResult = await nearFunctionCall(ctx, 'push', {
                pack_data: packB64,
                ref_updates: refUpdates,
            });
            if (!pushResult.success) {
                try {
                    const dbg = await caches.open('near-git-debug');
                    await dbg.put('/last-push-error', new Response(pushResult.error));
                } catch (e) { }
                // report-status framing: first line must be "unpack <status>",
                // then one "ng <refname> <reason>" per rejected ref. A bare
                // "ng unpack ..." first line makes libgit2 fail with the opaque
                // "report-status: protocol error", hiding the real cause.
                return makeReceivePackResponse([
                    `unpack ${pushResult.error}`,
                    ...refUpdates.map(u => `ng ${u.name} ${pushResult.error}`),
                ]);
            }
        }
    }

    // Read-your-writes: optimistic-finality views can lag broadcast_tx_commit
    // by several seconds, so a clone right after this push would see the old
    // refs (stale editor content, CAS failures on the next push). Hold the
    // push response until get_refs reflects what we just pushed.
    if (refUpdates.length > 0) {
        await waitForRefsToCatchUp(ctx, refUpdates);
    }

    const statusLines = ['unpack ok'];
    for (const update of refUpdates) {
        statusLines.push(`ok ${update.name}`);
    }
    return makeReceivePackResponse(statusLines);
}

async function waitForRefsToCatchUp(ctx, refUpdates, timeoutMs = 10000) {
    const deadline = Date.now() + timeoutMs;
    for (;;) {
        try {
            const refs = await nearViewCall(ctx, 'get_refs', {});
            const refMap = Object.fromEntries(refs);
            const caughtUp = refUpdates.every(u =>
                u.new_sha === ZERO_SHA
                    ? !(u.name in refMap)
                    : refMap[u.name] === u.new_sha);
            if (caughtUp) return;
        } catch (e) {
            console.warn('[near-git-sw] get_refs poll failed', e);
        }
        if (Date.now() >= deadline) {
            console.warn('[near-git-sw] refs still stale after push, giving up wait');
            return;
        }
        await new Promise(r => setTimeout(r, 250));
    }
}

async function handleUploadPack(ctx, body) {
    const { lines } = readPktLines(body);
    const decoder = new TextDecoder();
    const wants = [];
    const haves = [];

    for (const line of lines) {
        const text = decoder.decode(line).trim();
        if (text.startsWith('want ')) wants.push(text.split(' ')[1]);
        else if (text.startsWith('have ')) haves.push(text.split(' ')[1]);
    }

    if (wants.length === 0) {
        return new Response(
            concatUint8Arrays([pktLineEncodeString('NAK\n'), pktLineFlush()]),
            { headers: { 'Content-Type': 'application/x-git-upload-pack-result' } },
        );
    }

    const packCount = await nearViewCall(ctx, 'get_pack_count', {});
    console.log(`[near-git-sw] fetching ${packCount} packs`);

    if (packCount === 0) {
        return new Response(
            concatUint8Arrays([pktLineEncodeString('NAK\n'), pktLineFlush()]),
            { headers: { 'Content-Type': 'application/x-git-upload-pack-result' } },
        );
    }

    const packsResult = await nearViewCallBorsh(ctx, 'get_packs', 0);

    // Walk every pack, collecting all base objects into localMap and every
    // delta into a pending list. Single-pass resolution would silently drop
    // deltas whose base lives in a later pack, or delta-of-delta chains where
    // an intermediate base only exists after another delta is resolved —
    // libgit2 then complains "cannot resolve ref_delta as ofs_delta base".
    //
    // delta.chain (from the rust parser) carries OFS_DELTAs stacked on top of
    // a foreign REF_DELTA: empty for the simple REF_DELTA case, non-empty
    // when the same pack had OFS_DELTAs piled on top of an external base.
    // Apply order: delta_data first (REF_DELTA against base SHA), then each
    // entry in chain on the running result.
    const allObjects = [];
    const localMap = {};
    const pendingDeltas = [];
    for (const packBytes of packsResult) {
        const parseResult = JSON.parse(parse_packfile(packBytes));
        if (parseResult.objects) {
            for (const obj of parseResult.objects) {
                const data = Uint8Array.from(atob(obj.data), c => c.charCodeAt(0));
                const sha = git_sha1(obj.obj_type, data);
                if (!localMap[sha]) {
                    localMap[sha] = { obj_type: obj.obj_type, data };
                    allObjects.push(obj);
                }
            }
        }
        if (parseResult.deltas) {
            for (const delta of parseResult.deltas) {
                pendingDeltas.push({
                    base_sha: delta.base_sha,
                    deltaData: Uint8Array.from(atob(delta.delta_data), c => c.charCodeAt(0)),
                    chain: (delta.chain || []).map(c =>
                        Uint8Array.from(atob(c), ch => ch.charCodeAt(0))),
                });
            }
        }
    }

    // Multi-pass: keep resolving deltas whose base is now known, until a pass
    // adds nothing. Walks back-to-front so splice() doesn't perturb the index.
    let progress = true;
    while (progress && pendingDeltas.length > 0) {
        progress = false;
        for (let i = pendingDeltas.length - 1; i >= 0; i--) {
            const delta = pendingDeltas[i];
            const base = localMap[delta.base_sha];
            if (!base) continue;
            let current = apply_delta(base.data, delta.deltaData);
            for (const d of delta.chain) current = apply_delta(current, d);
            const sha = git_sha1(base.obj_type, current);
            if (!localMap[sha]) {
                localMap[sha] = { obj_type: base.obj_type, data: current };
                allObjects.push({ obj_type: base.obj_type, data: uint8ArrayToBase64(current) });
            }
            pendingDeltas.splice(i, 1);
            progress = true;
        }
    }
    if (pendingDeltas.length > 0) {
        const orphans = pendingDeltas.map(d => d.base_sha);
        console.error('[near-git-sw] upload-pack: unresolved deltas', orphans);
        return new Response(`unresolved delta bases: ${orphans.join(', ')}`,
            { status: 500 });
    }

    const packData = build_packfile(JSON.stringify(allObjects));
    const nak = pktLineEncodeString('NAK\n');
    return new Response(concatUint8Arrays([nak, packData]), {
        headers: { 'Content-Type': 'application/x-git-upload-pack-result' },
    });
}

function makeReceivePackResponse(lines) {
    const parts = lines.map(l => pktLineEncodeString(l + '\n'));
    parts.push(pktLineFlush());
    return new Response(concatUint8Arrays(parts), {
        headers: { 'Content-Type': 'application/x-git-receive-pack-result' },
    });
}

function concatUint8Arrays(arrays) {
    const total = arrays.reduce((s, a) => s + a.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;
    for (const a of arrays) { result.set(a, offset); offset += a.length; }
    return result;
}

function uint8ArrayToBase64(data) {
    let binary = '';
    for (let i = 0; i < data.length; i++) binary += String.fromCharCode(data[i]);
    return btoa(binary);
}
