// The tool set is shared by both provider paths (local Agent SDK + in-browser
// NEAR AI). These tests pin the properties both depend on — the previous
// arrangement was two hand-maintained lists, and the first tool added after
// that comment reached only one of them.
//
// Run with: npm run test-agent-tools

import { test } from 'node:test';
import assert from 'node:assert';
import { TOOL_DEFS, browserToolNames, sdkToolNames, toolDefsFor } from './tools-def.js';
import { toOpenAiTools } from './nearai-core.js';

test('every tool is declared once, with a description and an object schema', () => {
    const names = TOOL_DEFS.map((d) => d.name);
    assert.deepStrictEqual(names, [...new Set(names)], 'duplicate tool name');
    for (const def of TOOL_DEFS) {
        assert.match(def.name, /^[a-z][a-z0-9_]*$/, `bad tool name ${def.name}`);
        assert.ok(def.description && def.description.length > 20, `${def.name}: needs a real description`);
        assert.strictEqual(def.parameters.type, 'object', `${def.name}: schema must be an object`);
        for (const [prop, spec] of Object.entries(def.parameters.properties || {})) {
            assert.ok(['string', 'number', 'boolean'].includes(spec.type),
                `${def.name}.${prop}: unsupported type ${spec.type} (the SDK path converts these to zod)`);
        }
        for (const req of def.parameters.required || []) {
            assert.ok(def.parameters.properties?.[req], `${def.name}: required "${req}" is not a property`);
        }
        assert.ok(['browser', 'loadfile', 'repofile'].includes(def.where), `${def.name}: unknown where "${def.where}"`);
    }
});

test('the shader tools reach BOTH providers', () => {
    // The regression that motivated sharing the list: these existed only in the
    // Agent SDK path, so the in-browser NEAR AI agent (and the Pages Function
    // proxy, which injects this same list server-side) could not fix a shader.
    const shaderTools = ['get_shader', 'set_shader', 'edit_shader', 'grep_shader'];
    const openai = toOpenAiTools().map((t) => t.function.name);
    for (const name of shaderTools) {
        assert.ok(browserToolNames().includes(name), `${name} missing from the browser tool set`);
        assert.ok(sdkToolNames().includes(name), `${name} missing from the SDK tool list`);
        assert.ok(openai.includes(name), `${name} missing from the OpenAI/NEAR AI definitions`);
    }
});

test('serverless mode gets the repo-file readers, the SDK path does not', () => {
    // The local agent has built-in Read/Glob/Grep instead.
    assert.deepStrictEqual(toolDefsFor('repofile').map((d) => d.name), ['read_repo_file']);
    assert.ok(!sdkToolNames().includes('read_repo_file'));
    assert.ok(toOpenAiTools().some((t) => t.function.name === 'read_repo_file'));
    // ...but the file loaders exist in both (different implementations).
    for (const name of ['load_synth_from_file', 'load_song_from_file']) {
        assert.ok(sdkToolNames().includes(name));
        assert.ok(toOpenAiTools().some((t) => t.function.name === name));
    }
});

test('run_script reaches both providers and runs in the browser', () => {
    // The sandbox lives in the browser, so the serverless tier gets it for free
    // and the SDK path proxies it like every other browser tool.
    const def = TOOL_DEFS.find((d) => d.name === 'run_script');
    assert.equal(def.where, 'browser');
    assert.deepEqual(def.parameters.required, ['code']);
    assert.ok(sdkToolNames().includes('run_script'));
    assert.ok(toOpenAiTools().some((t) => t.function.name === 'run_script'));
    for (const helper of ['findPlayBlocks', 'parseNotes', 'formatNotes', 'groupByBeat', 'setSong']) {
        assert.ok(def.description.includes(helper), `run_script's description must name ${helper}`);
    }
});

test('there is no play tool — starting playback stays the user\'s action', () => {
    assert.ok(!TOOL_DEFS.some((d) => d.name === 'play'));
    assert.ok(TOOL_DEFS.some((d) => d.name === 'stop'));
});

test('OpenAI conversion keeps names, descriptions and schemas intact', () => {
    const tools = toOpenAiTools();
    assert.strictEqual(tools.length, TOOL_DEFS.length);
    for (const tool of tools) {
        assert.strictEqual(tool.type, 'function');
        const def = TOOL_DEFS.find((d) => d.name === tool.function.name);
        assert.ok(def, `unexpected tool ${tool.function.name}`);
        assert.strictEqual(tool.function.description, def.description);
        assert.deepStrictEqual(tool.function.parameters, def.parameters);
    }
});
