# WebAssembly Music Instrument Plugin

The WebAssembly Music Instrument Plugin is a JUCE-based audio plugin that allows you to load and play synthesizers and instruments compiled to WebAssembly (Wasm) inside your favorite Digital Audio Workstation (DAW). With this plugin, you can experiment with new sound engines, custom synths, and music tools written in any language that compiles to Wasm, and run them natively with low latency and high performance.

## What does it do?
- Lets you select and load any compatible `.wasm` instrument or synth module at runtime.
- Compiles the selected Wasm file to a native `.so` file using WasmEdge, and loads it into the plugin for real-time audio and MIDI processing.
- Supports dynamic instrument switching, so you can experiment with different sound engines without restarting your DAW.
- Provides a simple UI for browsing and selecting Wasm files, and for choosing MIDI instruments.

## Why WebAssembly?
WebAssembly is a portable, fast, and secure binary format that enables new ways to create and share music technology. The WebAssembly Music Instrument Plugin is designed specifically to support WebAssembly modules created using the [WebAssembly Music project](https://github.com/petersalomonsen/javascriptmusic), where instruments are coded in AssemblyScript. This approach allows for:
- Easy experimentation with new synth architectures and DSP code in a high-level, JavaScript-like language.
- Seamless integration of custom instruments and sound engines into your DAW.
- Sandboxed execution for safety and stability.

By supporting the WebAssembly Music project, this plugin empowers both developers and musicians to explore new creative possibilities with AssemblyScript-based instruments.

Whether you're a developer wanting to test your Wasm synths in a DAW, or a musician looking for new and unique sounds, this plugin provides a flexible and modern workflow.

[See a quick demo video here.](https://youtube.com/shorts/eMaIROla9eI?si=ZmcpAer8zDZ-9po9)

# Instructions for building for OSX on Apple Silicon

## Install LLVM 16

WasmEdge 0.14.1 requires LLVM 16 for building.

```bash
brew install llvm@16
export LLVM_DIR="$(brew --prefix)/opt/llvm@16/lib/cmake"   
export CC="$(brew --prefix)/opt/llvm@16/bin/clang"
export CXX="$(brew --prefix)/opt/llvm@16/bin/clang++"
```

## Build WasmEdge

```bash
wget https://github.com/WasmEdge/WasmEdge/releases/download/0.14.1/WasmEdge-0.14.1-src.tar.gz
tar -xvzf WasmEdge-0.14.1-src.tar.gz
cd wasmedge
cmake -Bbuild -GNinja -DCMAKE_BUILD_TYPE=Release -DWASMEDGE_LINK_LLVM_STATIC=ON -DWASMEDGE_BUILD_SHARED_LIB=Off -DWASMEDGE_BUILD_STATIC_LIB=On -DWASMEDGE_LINK_TOOLS_STATIC=On -DWASMEDGE_BUILD_PLUGINS=Off
cmake --build build
```

## Download JUCE and build the project

Use AppleClang 16 here ( start a new shell without the exports for LLVM, CC and CXX from above ).

```bash
wget https://github.com/juce-framework/JUCE/releases/download/8.0.7/juce-8.0.7-osx.zip
unzip juce-8.0.7-osx.zip
cmake -Bbuild -DCMAKE_BUILD_TYPE=Release && cmake --build build --config Release
```

# Verify the plugin

```bash
auval -v aumu Wasm WaMu
```
