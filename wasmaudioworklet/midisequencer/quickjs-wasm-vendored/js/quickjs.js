import { Wasi } from "./wasi.js";

/* Tag values from quickjs-2026-06-04/quickjs.h — must match the QuickJS
   version jseval.wasm is built from. */
const JS_TAG_FIRST = -9; /* first negative tag */
const JS_TAG_BIG_INT = -9;
const JS_TAG_SYMBOL = -8;
const JS_TAG_STRING = -7;
const JS_TAG_STRING_ROPE = -6;
const JS_TAG_MODULE = -3; /* used internally */
const JS_TAG_FUNCTION_BYTECODE = -2; /* used internally */
const JS_TAG_OBJECT = -1;

const JS_TAG_INT = 0;
const JS_TAG_BOOL = 1;
const JS_TAG_NULL = 2;
const JS_TAG_UNDEFINED = 3;
const JS_TAG_UNINITIALIZED = 4;
const JS_TAG_CATCH_OFFSET = 5;
const JS_TAG_EXCEPTION = 6;
const JS_TAG_SHORT_BIG_INT = 7;
const JS_TAG_FLOAT64 = 8;

/* jseval.wasm is a 32-bit build, so QuickJS NaN-boxes doubles: a float64
   JSValue is the raw double bits minus (addend << 32), which makes its
   "tag" (upper 32 bits) fall outside the enumerated tag range above. */
const JS_FLOAT64_TAG_ADDEND = BigInt(0x7ff80000 - JS_TAG_FIRST + 1);

const float64scratch = new DataView(new ArrayBuffer(8));
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

class QuickJS {
  constructor() {
    this.hostFunctions = {};
    this.pendingAsyncInvocations = [];

    this.wasmInstancePromise = (async () => {
      this.wasi = new Wasi({
        LANG: "en_GB.UTF-8",
        TERM: "xterm",
      });
      this.stdoutlines = [];
      this.stderrlines = [];
      this.wasi.stdout = (...data) => {
        this.stdoutlines.push(data.join(" "));
        console.log(...data);
      };
      this.wasi.stderr = (...data) => {
        this.stderrlines.push(data.join(" "));
        console.error(...data);
      };
      const url = new URL("../jseval.wasm", import.meta.url);
      const wasm =
        url.protocol === "file:"
          ? await (await import("fs/promises")).readFile(url)
          : await fetch(url).then((r) => r.arrayBuffer());

      const mod = (
        await WebAssembly.instantiate(wasm, {
          wasi_snapshot_preview1: this.wasi,
          env: {
            js_host_time_ms: () => Date.now(),
            js_call_host_async: async (params, resolving_func) => {
              this.pendingAsyncInvocations.push(
                new Promise(async (resolvePendingInvocation) => {
                  try {
                    const hostFunctionName = this.getObjectPropertyValue(
                      params,
                      "function_name",
                    );
                    if (this.hostFunctions[hostFunctionName]) {
                      const result =
                        await this.hostFunctions[hostFunctionName](params);
                      this.wasmInstance.promise_callback(
                        resolving_func,
                        result,
                      );
                    } else {
                      this.wasmInstance.promise_callback(resolving_func, null);
                    }
                  } finally {
                    resolvePendingInvocation();
                  }
                }),
              );
            },
          },
        })
      ).instance;
      this.wasi.init(mod);
      this.wasmInstance = mod.exports;
      this.wasmInstance.init();
      return mod.exports;
    })();
  }

  allocateString(str) {
    const instance = this.wasmInstance;
    const encoded = textEncoder.encode(str);
    const straddr = instance.malloc(encoded.length + 1);
    const buf = new Uint8Array(
      instance.memory.buffer,
      straddr,
      encoded.length + 1,
    );
    buf.set(encoded);
    buf[encoded.length] = 0;
    return straddr;
  }

  allocateJSstring(str) {
    const strPtr = this.allocateString(str);
    const jsString = this.wasmInstance.new_js_string(strPtr);
    this.wasmInstance.free(strPtr);
    return jsString;
  }

  ptrToString(ptr) {
    const memorybuf = new Uint8Array(this.wasmInstance.memory.buffer);
    const end = memorybuf.indexOf(0, ptr);
    return textDecoder.decode(memorybuf.subarray(ptr, end));
  }

  /**
   * Limit how much memory the QuickJS runtime may allocate. Allocations
   * beyond the limit fail with an "out of memory" exception inside the
   * sandbox without affecting the host.
   */
  setMemoryLimit(bytes) {
    this.wasmInstance.set_memory_limit(bytes);
  }

  /**
   * Request that the currently scheduled guest execution is interrupted at
   * the next interrupt check. Useful from host functions to cancel a guest
   * that is about to resume. Cleared automatically when a timeout-guarded
   * call completes.
   */
  requestInterrupt() {
    this.wasmInstance.request_interrupt();
  }

  withEvalDeadline(timeoutMs, fn) {
    if (!timeoutMs) {
      return fn();
    }
    this.wasmInstance.set_eval_deadline(Date.now() + timeoutMs);
    try {
      return fn();
    } finally {
      this.wasmInstance.clear_interrupt();
    }
  }

  evalSource(src, modulefilename = "<evalsource>", timeoutMs = 0) {
    const instance = this.wasmInstance;
    return this.withEvalDeadline(timeoutMs, () =>
      this.convertReturnValue(
        instance.eval_js_source(
          this.allocateString(modulefilename),
          this.allocateString(src),
          modulefilename != "<evalsource>",
        ),
      ),
    );
  }

  getObjectPropertyValue(jsval, propertyname) {
    return this.convertReturnValue(
      this.wasmInstance.get_js_obj_property(
        jsval,
        this.allocateString(propertyname),
      ),
    );
  }

  getPromiseResult(jsval) {
    return this.convertReturnValue(this.wasmInstance.get_promise_result(jsval));
  }

  async waitForPendingAsyncInvocations() {
    while (this.pendingAsyncInvocations.length > 0) {
      const pending = [...this.pendingAsyncInvocations];
      this.pendingAsyncInvocations = [];
      await Promise.all(pending);
    }
  }

  convertReturnValue(jsval) {
    const tag = Number(jsval >> 32n);
    if ((tag - JS_TAG_FIRST) >>> 0 >= JS_TAG_FLOAT64 - JS_TAG_FIRST) {
      float64scratch.setBigUint64(
        0,
        BigInt.asUintN(64, jsval + (JS_FLOAT64_TAG_ADDEND << 32n)),
      );
      return float64scratch.getFloat64(0);
    }
    switch (tag) {
      case JS_TAG_INT:
        return Number(BigInt.asIntN(32, jsval));
      case JS_TAG_BOOL:
        return BigInt.asIntN(32, jsval) !== 0n;
      case JS_TAG_STRING:
      case JS_TAG_STRING_ROPE:
        return this.ptrToString(this.wasmInstance.get_js_string(jsval));
      case JS_TAG_OBJECT:
        return jsval;
      case JS_TAG_NULL:
        return null;
      case JS_TAG_UNDEFINED:
        return undefined;
      case JS_TAG_EXCEPTION:
        throw new Error(
          this.stdoutlines[this.stdoutlines.length - 1] ??
            "Exception in QuickJS",
        );
    }
  }

  allocateBuf(binarydata) {
    const instance = this.wasmInstance;
    const bufaddr = instance.malloc(binarydata.length);
    const buf = new Uint8Array(
      instance.memory.buffer,
      bufaddr,
      binarydata.length,
    );
    for (let n = 0; n < binarydata.length; n++) {
      buf[n] = binarydata[n];
    }
    return { addr: bufaddr, len: buf.length };
  }

  loadByteCode(bytecode) {
    const { addr, len } = this.allocateBuf(bytecode);
    return this.wasmInstance.load_js_bytecode(addr, len);
  }

  callModFunction(mod, functionname, timeoutMs = 0) {
    return this.withEvalDeadline(timeoutMs, () =>
      this.convertReturnValue(
        this.wasmInstance.call_js_function(
          mod,
          this.allocateString(functionname),
        ),
      ),
    );
  }

  evalByteCode(bytecode, timeoutMs = 0) {
    const { addr, len } = this.allocateBuf(bytecode);
    return this.withEvalDeadline(timeoutMs, () =>
      this.convertReturnValue(this.wasmInstance.eval_js_bytecode(addr, len)),
    );
  }

  compileToByteCode(src, modulefilename = "<evalsource>") {
    const instance = this.wasmInstance;
    const compiledbytecodebuflenptr = instance.malloc(4);
    const compiledbytecodeaddr = instance.compile_to_bytecode(
      this.allocateString(modulefilename),
      this.allocateString(src),
      compiledbytecodebuflenptr,
      modulefilename != "<evalsource>",
    );

    const compiledbytecodebuflen = new Uint32Array(
      instance.memory.buffer,
      compiledbytecodebuflenptr,
      4,
    )[0];
    console.log("len", compiledbytecodebuflen);

    return new Uint8Array(
      instance.memory.buffer,
      compiledbytecodeaddr,
      compiledbytecodebuflen,
    );
  }
}

export async function createQuickJS() {
  const quickjs = new QuickJS();
  await quickjs.wasmInstancePromise;
  return quickjs;
}
