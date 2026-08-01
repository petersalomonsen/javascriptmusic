export default {
  entries: ["assembly/__tests__/**/*.spec.ts"],
  include: ["assembly/__tests__/**/*.include.ts"],
  // Compiler options (including "runtime": "stub") live in as-pect.asconfig.json.
  // as-pect 9 ignores a `flags` block here, so setting them below has no effect.
  disclude: [/node_modules/i],
  async instantiate(memory, createImports, instantiate, binary) {
    let instance; // Imports can reference this
    const myImports = {
      env: { memory }
      // put your web assembly imports here, and return the module promise
    };
    instance = instantiate(binary, createImports(myImports));
    return instance;
  },
  outputBinary: false,
};
