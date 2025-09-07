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

### Handling macOS Security Warning

When you first try to use the plugin, macOS will show a security warning because the plugin is not signed with an Apple Developer certificate. Here's how to authorize it:

1. **When you see the warning dialog**:
   - Click "Done" (not "Move to Bin")
   
2. **Open System Settings**:
   - Go to Apple Menu > System Settings (or System Preferences on older macOS)
   - Navigate to Privacy & Security
   
3. **Authorize the plugin**:
   - Scroll down to the Security section
   - You should see a message about "WebAssemblyMusicSynth.component" being blocked
   - Click "Open Anyway" or "Allow Anyway"
   
4. **Try again in your DAW**:
   - Close and reopen your DAW
   - Load the plugin again
   - You may see one more dialog - click "Open" to confirm

**Alternative method using Terminal**:
If the above doesn't work, you can remove the quarantine flag manually:
```bash
/usr/bin/xattr -dr com.apple.quarantine ~/Library/Audio/Plug-Ins/Components/WebAssemblyMusicSynth.component
```
Note: Use `/usr/bin/xattr` to ensure you're using the system version, not a Homebrew version.

### Other Troubleshooting

- **Plugin not showing up**: Make sure the component file is in the correct directory and restart your DAW
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