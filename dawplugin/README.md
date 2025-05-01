# Instructions for OSX on Apple Silicon

## Install LLVM 16

WasmEdge 0.14.1 requires LLVM 16 for building.

```
brew install llvm@16
export LLVM_DIR="$(brew --prefix)/opt/llvm@16/lib/cmake"   
export CC="$(brew --prefix)/opt/llvm@16/bin/clang"
export CXX="$(brew --prefix)/opt/llvm@16/bin/clang++"
```

## Build WasmEdge

```
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

## Install the plugin

```bash
cp -R build/WasmEdgeSynth_artefacts/Release/AU/WasmEdgeSynth.component ~/Library/Audio/Plug-Ins/Components/
codesign --deep --force --sign - ~/Library/Audio/Plug-Ins/Components/WasmEdgeSynth.component
```

# Verify the plugin

```bash
auval -v aumu Wedg WaMu
```