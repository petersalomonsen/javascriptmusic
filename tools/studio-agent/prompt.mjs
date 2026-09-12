// The system prompt lives in the web app so the in-browser agent loop
// (NEAR AI serverless mode) can import it too — single source of truth.
export {
  SYSTEM_PROMPT, SDK_PROMPT_SUFFIX, SECTIONS, SECTION_NAMES,
  buildSystemPrompt, buildProducerPrompt, buildSpecialistPrompt,
} from '../../wasmaudioworklet/studio-agent/prompt.js';
