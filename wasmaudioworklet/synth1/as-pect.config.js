export default {
  entries: ["assembly/__tests__/**/*.spec.ts"],
  include: ["assembly/__tests__/**/*.include.ts"],
  flags: {
    "--runtime": ["stub"]
  },
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
