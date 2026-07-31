# session-video

Records a vertical (9:16) video of a real studio-agent session — for YouTube
Shorts and similar.

```sh
(cd wasmaudioworklet && node devserver.js)      # in another shell
node tools/session-video/record.mjs --cut cuts/chords-to-full-track.mjs
# -> tools/session-video/out/chords-to-full-track.mp4  (1080x1920, H.264 + AAC)
```

Options: `--cut` (default `cuts/chords-to-full-track.mjs`), `--beats 0,1` to
record a subset while you iterate, `--out`, `--outdir`, `--url`.

**Session logs are gitignored**, so a committed cut only replays on the machine
that still has the log it names. The cuts are kept in the repo as worked examples
of the format, not as reproducible builds.

## What it actually does

A mock WebSocket server plays the agent's role, speaking the same protocol as
`tools/studio-agent/server.mjs`. The prose is scripted, but **the tool calls are
the real ones**, replayed with their original arguments straight out of the
session log — so every `edit_song`, `write_faust` and `compile` genuinely runs in
the browser. The music in the video is the actual synth output of the actual
edits, not a re-enactment. Thinking time simply isn't in the script, so there is
no dead air.

The app runs in `?defaultrepo=1` (local OPFS workspace), so `write_faust` works
without the NEAR sandbox. Playwright launches a throwaway profile, so OPFS starts
empty every run.

## Audio

Video and audio go into a **single** `MediaRecorder`: tab-capture video plus a
`MediaStreamAudioDestinationNode` tapped off the live `audioworkletnode`. One
container, one clock — no A/V sync correction. The audio is taken from the audio
graph, not the speakers, so it is clean and needs no loopback device.

This is why the browser must be **headed**: `getDisplayMedia` returns
`NotSupportedError` in headless Chromium. `--auto-accept-this-tab-capture`
handles the picker, and tab capture needs no macOS screen-recording permission.

MediaRecorder emits every 2s and Node drains to disk as it goes, so a long take
doesn't hoard blobs in the page.

## Making another video

`record.mjs` knows nothing about any particular session. Everything specific to
one video lives in a **cut** under `cuts/`, which exports:

- `SESSION_LOG` — path (from the repo root) to the studio-agent session to replay
- `BEATS` — the curated beats, each with a `prompt`, the agent's `say` lines, and
  `tools`: ordinals into that log's `mcp__studio__` calls, in order

So a new video is a new file in `cuts/`, not a change to the recorder.

Curating one: prompts get trimmed to their essence and replies cut down to what
fits a phone screen — the real replies are paragraphs of verification detail,
accurate but unreadable at Shorts pace. Leave out `song_summary` and
`probe_instrument`: they are the agent checking its own work, they make no sound,
and they cost ~10s each. Watch out for `old_string` chains — skipping an
`edit_song`/`edit_synth` can leave a later one unable to match.

Only one document fits on a 432px-wide screen, so `showOnly()` shows exactly one
of song / synth / faust / agent at a time. `VIEW_FOR_TOOL` decides which document
the viewer is looking at while a tool runs; `compile` deliberately keeps the
current view, so you watch the code that just changed while you hear it change.
