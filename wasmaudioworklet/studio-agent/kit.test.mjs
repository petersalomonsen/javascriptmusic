import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadKit, resetKit, formatKit, KIT_FILE, MAX_KIT_CHARS } from './kit.js';

// The kit is the project's AGENT.md, delivered into the model's context at the
// start of every turn instead of being discovered with a tool call. These pin
// the selection rules; the browser→server delivery is covered by
// e2e/studio-agent-kit.spec.js.

const DEFAULT_TEXT = '# Performance kit — generic starter\n\nfallback body\n';
const okFetch = async () => ({ ok: true, text: async () => DEFAULT_TEXT });
const missingFetch = async () => ({ ok: false, text: async () => '' });
const noRepoFile = async () => { throw new Error('ENOENT'); };

test.beforeEach(() => resetKit());

test("the project's AGENT.md wins over the shipped default", async () => {
    const kit = await loadKit({
        readFile: async (name) => {
            assert.equal(name, KIT_FILE);
            return '# My performance\n\nchannel 0 is the kick.\n';
        },
        fetchFn: okFetch,
    });
    assert.equal(kit.source, 'repo');
    assert.match(kit.text, /My performance/);
});

test('falls back to the shipped default when the repo has no AGENT.md', async () => {
    const kit = await loadKit({ readFile: noRepoFile, fetchFn: okFetch });
    assert.equal(kit.source, 'default');
    assert.match(kit.text, /generic starter/);
});

test('an empty or whitespace-only AGENT.md is treated as absent', async () => {
    const kit = await loadKit({ readFile: async () => '   \n\n', fetchFn: okFetch });
    assert.equal(kit.source, 'default');
});

test('serves no kit rather than failing the turn when both sources are gone', async () => {
    const kit = await loadKit({ readFile: noRepoFile, fetchFn: missingFetch });
    assert.equal(kit.source, 'none');
    assert.equal(kit.text, '');
});

test('a runaway kit is truncated — it is resent on every turn', async () => {
    const kit = await loadKit({ readFile: async () => 'x'.repeat(MAX_KIT_CHARS * 2), fetchFn: okFetch });
    assert.ok(kit.text.length < MAX_KIT_CHARS + 100, 'capped near the limit');
    assert.match(kit.text, /\[kit truncated\]$/);
});

test('the result is cached — the repo is not re-read every turn', async () => {
    let reads = 0;
    const readFile = async () => { reads++; return '# once\n'; };
    await loadKit({ readFile, fetchFn: okFetch });
    await loadKit({ readFile, fetchFn: okFetch });
    assert.equal(reads, 1);
    resetKit();
    await loadKit({ readFile, fetchFn: okFetch });
    assert.equal(reads, 2);
});

test('formatKit labels the content as the user\'s project instructions', async () => {
    const out = formatKit('channel 0 is the kick.');
    assert.match(out, /AGENT\.md/);
    assert.match(out, /channel 0 is the kick\./);
    // Steers away from the discovery round-trip the kit exists to remove.
    assert.match(out, /instead of searching/);
});

test('formatKit returns nothing for an empty kit, so no empty section is sent', () => {
    assert.equal(formatKit(''), '');
    assert.equal(formatKit('   '), '');
});
