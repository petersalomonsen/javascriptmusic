/* tslint:disable */
/* eslint-disable */

/**
 * Apply a binary delta to a source object.
 */
export function apply_delta(source: Uint8Array, delta: Uint8Array): Uint8Array;

/**
 * Decode borsh get_objects result → JSON string
 * `[[sha, {obj_type, data(base64)}], [sha, null], ...]`
 */
export function borsh_decode_objects(data: Uint8Array): string;

/**
 * Borsh-encode git objects for push_objects (JSON input with base64 data → borsh bytes).
 *
 * Input: JSON array of `[{sha, obj_type, data(base64)}, ...]`
 * Output: borsh-encoded `Vec<GitObject>` bytes
 */
export function borsh_encode_push_objects(objects_json: string): Uint8Array;

/**
 * Borsh-encode SHA list for get_objects (JSON array → borsh bytes).
 *
 * Input: JSON array of SHA strings `["abc123", ...]`
 * Output: borsh-encoded `Vec<String>` bytes
 */
export function borsh_encode_shas(shas_json: string): Uint8Array;

/**
 * Build a packfile from objects (JSON array of {obj_type, data(base64)}).
 */
export function build_packfile(objects_json: string): Uint8Array;

/**
 * Build a thin packfile with delta compression against external base objects.
 * `objects_json`: new objects to include (JSON array of {obj_type, data(base64)})
 * `bases_json`: existing objects for delta computation, NOT included in output
 */
export function build_packfile_with_bases(objects_json: string, bases_json: string): Uint8Array;

/**
 * Create a signed NEAR function call transaction, returned as base64.
 *
 * - `signer_id`: e.g. "alice.near"
 * - `public_key_b58`: base58-encoded ed25519 public key (without "ed25519:" prefix)
 * - `private_key_b58`: base58-encoded ed25519 private key (without "ed25519:" prefix)
 * - `receiver_id`: contract account, e.g. "repo.near"
 * - `method_name`: e.g. "push_objects"
 * - `args`: raw method argument bytes (borsh or JSON depending on method)
 * - `nonce`: access key nonce + 1
 * - `block_hash_b58`: recent block hash in base58
 * - `gas`: gas to attach (e.g. 300000000000000 = 300 TGas)
 * - `deposit`: attached deposit in yoctoNEAR (as string, e.g. "0")
 */
export function create_signed_transaction(signer_id: string, public_key_b58: string, private_key_b58: string, receiver_id: string, method_name: string, args: Uint8Array, nonce: bigint, block_hash_b58: string, gas: bigint, deposit: string): string;

/**
 * Compute the git SHA-1 hash for an object.
 */
export function git_sha1(obj_type: string, data: Uint8Array): string;

/**
 * Parse a packfile and return objects + deltas as JSON.
 */
export function parse_packfile(data: Uint8Array): string;

/**
 * Zlib-compress data.
 */
export function zlib_compress(data: Uint8Array): Uint8Array;

/**
 * Zlib-decompress data.
 */
export function zlib_decompress(data: Uint8Array): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly apply_delta: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly borsh_decode_objects: (a: number, b: number) => [number, number, number, number];
    readonly borsh_encode_push_objects: (a: number, b: number) => [number, number, number, number];
    readonly borsh_encode_shas: (a: number, b: number) => [number, number, number, number];
    readonly build_packfile: (a: number, b: number) => [number, number, number, number];
    readonly build_packfile_with_bases: (a: number, b: number, c: number, d: number) => [number, number, number, number];
    readonly create_signed_transaction: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number, j: number, k: number, l: number, m: bigint, n: number, o: number, p: bigint, q: number, r: number) => [number, number, number, number];
    readonly git_sha1: (a: number, b: number, c: number, d: number) => [number, number];
    readonly parse_packfile: (a: number, b: number) => [number, number, number, number];
    readonly zlib_compress: (a: number, b: number) => [number, number];
    readonly zlib_decompress: (a: number, b: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
