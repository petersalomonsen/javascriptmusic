// The system prompt lives in the web app so the in-browser agent loop
// (NEAR AI serverless mode) can import it too — single source of truth.
export { SYSTEM_PROMPT } from '../../wasmaudioworklet/studio-agent-prompt.js';
