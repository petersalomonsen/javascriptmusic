// The tool set is shared by both provider paths (local Agent SDK + in-browser
// NEAR AI). These tests pin the properties both depend on — the previous
// arrangement was two hand-maintained lists, and the first tool added after
// that comment reached only one of them.
//
// Run with: npm run test-agent-tools

import { test } from 'node:test';
import assert from 'node:assert';
import { TOOL_DEFS, browserToolNames, sdkToolNames, toolDefsFor, ROLES, toolDefsForRole, toolNamesForRole, specialistRoleForTool } from './tools-def.js';
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
        assert.ok(['browser', 'loadfile', 'repofile', 'agent'].includes(def.where), `${def.name}: unknown where "${def.where}"`);
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
    assert.strictEqual(tools.length, TOOL_DEFS.filter((d) => !d.image).length);
    for (const tool of tools) {
        assert.strictEqual(tool.type, 'function');
        const def = TOOL_DEFS.find((d) => d.name === tool.function.name);
        assert.ok(def, `unexpected tool ${tool.function.name}`);
        assert.strictEqual(tool.function.description, def.description);
        assert.deepStrictEqual(tool.function.parameters, def.parameters);
    }
});

test('roles: the producer delegates .dsp work, the instrument specialist gets only what an instrument needs', () => {
    const producer = toolNamesForRole('producer');
    const specialist = toolNamesForRole('instrument');
    // The producer never touches a .dsp; it delegates.
    assert.ok(producer.includes('design_instrument'));
    assert.ok(!producer.includes('write_faust') && !producer.includes('edit_faust'));
    // ...but keeps everything else, including reading what instruments exist.
    for (const n of ['get_song', 'edit_song', 'run_script', 'compile', 'probe_instrument', 'read_faust', 'list_faust', 'get_shader', 'load_synth_from_file', 'read_repo_file']) {
        assert.ok(producer.includes(n), `producer lacks ${n}`);
    }
    // The specialist has the faust tools, enough synth.ts to register a voice,
    // compile and probe — and no song, shader, script or delegation tools.
    for (const n of ['write_faust', 'edit_faust', 'read_faust', 'list_faust', 'get_synth', 'grep_synth', 'edit_synth', 'compile', 'probe_instrument', 'read_repo_file']) {
        assert.ok(specialist.includes(n), `specialist lacks ${n}`);
    }
    for (const n of ['get_song', 'set_song', 'edit_song', 'set_synth', 'set_shader', 'run_script', 'stop', 'design_instrument', 'load_synth_from_file']) {
        assert.ok(!specialist.includes(n), `specialist must not have ${n}`);
    }
    // Every name in an include list is a real tool (a typo would silently drop it).
    for (const n of ROLES.instrument.include) assert.ok(TOOL_DEFS.some((d) => d.name === n), `unknown tool in role: ${n}`);
    for (const n of ROLES.producer.exclude) assert.ok(TOOL_DEFS.some((d) => d.name === n), `unknown tool in role: ${n}`);
    // where-filtering: the SDK path never proxies read_repo_file; the browser path never sees the agent tool as a browser tool
    assert.ok(!toolNamesForRole('instrument', ['browser', 'loadfile']).includes('read_repo_file'));
    assert.ok(!browserToolNames().includes('design_instrument'));
    assert.deepEqual(toolDefsForRole('producer', ['agent']).map((d) => d.name), ['design_instrument', 'master_mix']);
    assert.throws(() => toolDefsForRole('dj'), /unknown agent role/);
});

test('design_instrument asks for what the specialist brief needs', () => {
    const def = TOOL_DEFS.find((d) => d.name === 'design_instrument');
    assert.equal(def.where, 'agent');
    assert.deepEqual(def.parameters.required, ['brief']);
    for (const p of ['brief', 'kind', 'channel', 'name']) assert.ok(def.parameters.properties[p], p);
    assert.ok(/FAILED/.test(def.description), 'the description tells the producer to expect an explicit failure line');
});

test('mastering: the tools reach both providers, the role holds the master insert and the mix, every agent tool names its specialist', () => {
    const openai = toOpenAiTools().map((t) => t.function.name);
    assert.ok(browserToolNames().includes('probe_mix'), 'probe_mix runs in the browser');
    assert.ok(sdkToolNames().includes('probe_mix'), 'the SDK path proxies probe_mix');
    for (const name of ['probe_mix', 'master_mix']) assert.ok(openai.includes(name), `${name} missing from the OpenAI/NEAR AI definitions`);
    // agent tools are not proxied; the SDK path runs the nested specialist itself (agent-core.mjs)
    assert.ok(!sdkToolNames().includes('master_mix'));
    const producer = toolNamesForRole('producer');
    assert.ok(producer.includes('probe_mix') && producer.includes('master_mix'));
    const mastering = toolNamesForRole('mastering');
    for (const n of ['get_synth', 'grep_synth', 'edit_synth', 'grep_song', 'edit_song', 'compile', 'probe_mix', 'auto_master', 'song_summary', 'read_repo_file']) {
        assert.ok(mastering.includes(n), `mastering lacks ${n}`);
    }
    // the optimiser belongs to the specialist: the producer delegates with master_mix
    assert.ok(!producer.includes('auto_master'));
    assert.ok(browserToolNames().includes('auto_master') && sdkToolNames().includes('auto_master'));
    // no whole-document rewrites, no instruments, no delegation, no other specialist's probe
    for (const n of ['set_song', 'set_synth', 'write_faust', 'edit_faust', 'probe_instrument', 'design_instrument', 'master_mix', 'run_script', 'stop']) {
        assert.ok(!mastering.includes(n), `mastering must not have ${n}`);
    }
    assert.ok(!toolNamesForRole('instrument').includes('probe_mix'));
    for (const n of ROLES.mastering.include) assert.ok(TOOL_DEFS.some((d) => d.name === n), `unknown tool in role: ${n}`);
    // the nested runs switch on this, so an agent tool without a role is a dead tool
    for (const d of TOOL_DEFS.filter((d) => d.where === 'agent')) assert.ok(ROLES[d.role], `${d.name}: role "${d.role}" is not in ROLES`);
    assert.equal(specialistRoleForTool('design_instrument'), 'instrument');
    assert.equal(specialistRoleForTool('master_mix'), 'mastering');
    assert.equal(specialistRoleForTool('compile'), null);
    const def = TOOL_DEFS.find((d) => d.name === 'master_mix');
    assert.deepEqual(def.parameters.required, []);
    for (const p of ['brief', 'target', 'targetLufs', 'truePeakDb']) assert.ok(def.parameters.properties[p], p);
    assert.ok(/FAILED/.test(def.description));
});

test('render_shader (an image result) reaches the SDK path only — the NEAR AI definitions leave it out', () => {
    // An OpenAI-style tool message is text only, so a provider on that path
    // could never see the frame; offering it would only invite a call whose
    // result is a base64 blob in the context.
    const def = TOOL_DEFS.find((d) => d.name === 'render_shader');
    assert.ok(def && def.image === true && def.where === 'browser');
    assert.ok(browserToolNames().includes('render_shader'));
    assert.ok(sdkToolNames().includes('render_shader'));
    assert.ok(!toOpenAiTools().some((t) => t.function.name === 'render_shader'));
    assert.ok(toolNamesForRole('producer').includes('render_shader'));
    for (const role of ['instrument', 'mastering']) assert.ok(!toolNamesForRole(role).includes('render_shader'), role);
});
