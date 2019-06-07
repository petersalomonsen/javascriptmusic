npm run fastbuild
#./node_modules/.bin/asc assembly/index.ts -b build/index.wasm --sourceMap -t build/index.wat
#node index.js | sox -S -t raw -b 32 -e float -r 44100 -c 2 - -d
node index.js | sox -S -t raw -b 32 -e float -r 44100 -c 2 - out.wav
