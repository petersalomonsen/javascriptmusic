export const SEQ_MSG_LOOP = -1;
export const SEQ_MSG_START_RECORDING = -2;
export const SEQ_MSG_STOP_RECORDING = -3;
export const SEQ_MSG_BROADCAST_SEND = -4;
export const SEQ_MSG_BROADCAST_WAIT = -5;
// Performance mode (docs/plans/performance-mode.md): a wait with a policy
// (loop the part / hold, quantized leave, default for non-performance renders,
// kiosk timeout) and the part markers that targeted signals jump to.
export const SEQ_MSG_WAIT_SIGNAL = -6;
export const SEQ_MSG_PART = -7;