# WebAssembly Music Synth Plugin - Installation Guide

## macOS Installation

### Prerequisites
- macOS 10.15 or later
- A DAW (Digital Audio Workstation) that supports Audio Unit (AU) plugins

### Installation Steps

1. **Download the plugin**
   - Download `WebAssemblyMusicSynth-macOS.zip` from the GitHub releases page

2. **Extract the plugin**
   - Double-click the downloaded ZIP file to extract it
   - You should see a `WebAssemblyMusicSynth.component` file

3. **Install the plugin**
   - Open Finder and press `Cmd+Shift+G`
   - Type `~/Library/Audio/Plug-Ins/Components` and press Enter
   - If the folder doesn't exist, create it
   - Copy the `WebAssemblyMusicSynth.component` file to this folder

4. **Verify installation in your DAW**
   - Launch your DAW (Logic Pro, Ableton Live, Reaper, etc.)
   - The plugin should appear in your AU instruments list as "WebAssembly Music Synth"
   - If the plugin doesn't appear, you may need to:
     - Rescan your plugins in your DAW's preferences
     - Restart your DAW
     - On newer macOS versions, you may need to authorize the plugin in System Settings > Privacy & Security

### Troubleshooting

- **Plugin not showing up**: Make sure the component file is in the correct directory and restart your DAW
- **Security warning**: On first launch, macOS may block the plugin. Go to System Settings > Privacy & Security and click "Open Anyway"
- **Compatibility issues**: Ensure your DAW supports Audio Unit (AU) plugins and is running the latest version

### Supported DAWs

This AU plugin has been tested with:
- Logic Pro X/11
- Ableton Live
- Reaper
- Studio One
- Cubase (with AU support enabled)

## Plugin Features

- WebAssembly-based synthesis engine
- MIDI input support
- Real-time audio processing
- Low latency performance

## Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/petersalomonsen/javascriptmusic).