#!/usr/bin/env node
// Local relay bridging the web app editors (over WebSocket) to Claude Code
// (over MCP/stdio). v1 surface: a single `get_active_buffer` tool.
//
// Architecture: the web app proactively pushes editor state on focus, content,
// and cursor changes. The relay caches the latest snapshot and serves it
// synchronously to MCP tool calls, avoiding a round-trip per call.

import { WebSocketServer } from 'ws';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const WS_PORT = Number(process.env.CLAUDE_BRIDGE_PORT) || 17890;

// Latest snapshot from whichever editor most recently reported focus + state.
// Shape: { id, editor_type, language, name, content, cursor, selection, updatedAt }
let activeEditor = null;
let connectedClients = 0;

const wss = new WebSocketServer({ port: WS_PORT });

wss.on('listening', () => {
    process.stderr.write(`[claude-bridge] WS listening on ws://localhost:${WS_PORT}\n`);
});

wss.on('connection', (ws) => {
    connectedClients++;
    process.stderr.write(`[claude-bridge] client connected (${connectedClients} total)\n`);

    ws.on('message', (data) => {
        let msg;
        try {
            msg = JSON.parse(data.toString());
        } catch (e) {
            process.stderr.write(`[claude-bridge] bad message: ${e.message}\n`);
            return;
        }
        if (msg.type === 'state') {
            activeEditor = {
                id: msg.editor?.id,
                editor_type: msg.editor?.editor_type,
                language: msg.editor?.language,
                name: msg.editor?.name,
                content: msg.content,
                cursor: msg.cursor,
                selection: msg.selection,
                updatedAt: Date.now(),
            };
        } else if (msg.type === 'blur') {
            if (activeEditor && activeEditor.id === msg.id) {
                activeEditor = null;
            }
        }
    });

    ws.on('close', () => {
        connectedClients--;
        if (connectedClients === 0) {
            activeEditor = null;
        }
    });
});

const server = new Server(
    { name: 'claude-editor-bridge', version: '0.0.1' },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: 'get_active_buffer',
            description:
                'Return the currently focused editor in the web app: its type ' +
                '(faust/song/synth/shader), language, file name, full content, ' +
                'cursor position, and selection (if any). Returns an error if ' +
                'no web app client is connected or no editor is focused.',
            inputSchema: {
                type: 'object',
                properties: {},
                additionalProperties: false,
            },
        },
    ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
    if (req.params.name === 'get_active_buffer') {
        if (!activeEditor) {
            return {
                content: [
                    {
                        type: 'text',
                        text:
                            connectedClients === 0
                                ? 'No web app client is connected to the bridge.'
                                : 'No editor is currently focused in the web app.',
                    },
                ],
                isError: true,
            };
        }
        return {
            content: [{ type: 'text', text: JSON.stringify(activeEditor, null, 2) }],
        };
    }
    return {
        content: [{ type: 'text', text: `Unknown tool: ${req.params.name}` }],
        isError: true,
    };
});

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write('[claude-bridge] MCP server ready on stdio\n');
