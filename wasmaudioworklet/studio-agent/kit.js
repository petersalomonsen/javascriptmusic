// The performance kit: agent instructions that travel WITH the project.
//
// A project repo may carry an `AGENT.md` describing the instruments, style and
// conventions for that piece. It is delivered to the model as context at the
// START of the session, never as something the agent has to go and read:
// measured over real sessions, turns that began with discovery tool calls ran
// ~2x the median and ~3x the p90 of turns that could act immediately. A kit
// that costs a `read_repo_file` round-trip would give most of that back.
//
// Two deliveries, because the two providers have different trust boundaries:
//   • local studio-agent — the kit rides on the chat message and the server
//     appends it to the system prompt (the user's own machine, own repo, and
//     the server cannot see OPFS at all, so the browser must send it).
//   • NEAR AI — the shared-key proxy deliberately STRIPS client system
//     messages and injects its own prompt, so the kit goes in as the first
//     USER message instead. That is the honest authority level anyway: repo
//     content is the user talking, not operator policy.
//
// Falls back to a generic starter kit so the app is usable with no repo.

export const KIT_FILE = 'AGENT.md';
// Kept well inside the proxy's 300k-char conversation cap — the kit is resent
// on every turn, so a bloated one is paid for over and over.
export const MAX_KIT_CHARS = 20000;

const DEFAULT_KIT_URL = new URL('./default-kit.md', import.meta.url);

let cached = null; // { text, source } once resolved

/**
 * Load the project's kit, falling back to the shipped default.
 * `readFile`/`fetchFn` are injectable so the logic can be unit-tested outside a
 * browser; production callers pass nothing.
 * @returns {Promise<{ text: string, source: 'repo' | 'default' | 'none' }>}
 */
export async function loadKit({ readFile, fetchFn = fetch } = {}) {
    if (cached) return cached;

    // Imported lazily: wasmgitclient pulls in browser-only modules, and keeping
    // it off the module's top level is what lets this file be unit-tested.
    const read = readFile
        || (async (name) => (await import('../wasmgit/wasmgitclient.js')).readfile(name));

    let text = '';
    let source = 'none';

    try {
        const fromRepo = await read(KIT_FILE);
        if (fromRepo && fromRepo.trim()) {
            text = fromRepo;
            source = 'repo';
        }
    } catch {
        // No AGENT.md in this project (or no repo at all) — fall through.
    }

    if (!text) {
        try {
            const res = await fetchFn(DEFAULT_KIT_URL);
            if (res.ok) {
                const fallback = await res.text();
                if (fallback.trim()) {
                    text = fallback;
                    source = 'default';
                }
            }
        } catch {
            // Serve without a kit rather than failing the turn.
        }
    }

    if (text.length > MAX_KIT_CHARS) {
        text = text.slice(0, MAX_KIT_CHARS) + '\n\n[kit truncated]';
    }

    cached = { text, source };
    return cached;
}

/** Drop the cache so the next turn re-reads the repo (after an edit/clone). */
export function resetKit() {
    cached = null;
}

/**
 * Wrap kit text for delivery. The heading tells the model what authority the
 * content carries, which matters most on the NEAR AI path where the kit
 * arrives as an ordinary user message.
 */
export function formatKit(text) {
    if (!text || !text.trim()) return '';
    return `## Project kit (from the project's ${KIT_FILE})\n\n` +
        `These are the user's instructions for THIS project — instrument sources, ` +
        `channel layout and conventions. Prefer them over generic defaults, and ` +
        `use them directly instead of searching the repository for the same ` +
        `information.\n\n${text}`;
}
