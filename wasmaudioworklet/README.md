Webassembly synth
=================

# Building

from the [synth1](synth1) folder:

`npm run asbuild` (for optimized build)

`npm run fastbuild` (for faster build and wat file)

# Run

`node webserver.js`

Browse to http://localhost:5000

# Export to wav

from the [synth1](synth1) folder.

the [synth1/index.js](synth1/index.js) script will output audio to `stdout`, so you may pipe it into e.g. [SoX]([sox](http://sox.sourceforge.net/)) like this:

`node index.js | sox -S -t raw -b 32 -e float -r 44100 -c 2 - out.wav`

