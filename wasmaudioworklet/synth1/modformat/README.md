Generate Amiga Protracker Modules
=================================

A Proof Of Concept rendering Amiga Protracker Modules from Javascript with samples generated from AssemblyScript.

Full build pipeline (from the parent directory, and remember to run `npm install` first):

`npm run fastbuild && node --experimental-modules modformat/song1.js`

This will output a module with filename `test.mod`