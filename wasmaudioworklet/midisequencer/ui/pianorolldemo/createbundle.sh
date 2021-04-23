cat ../../audioworkletprocessorsequencer.js > audioworkletprocessor.js
cat ../../../synth1/audioworklet/midisynthaudioworkletprocessor.js >> audioworkletprocessor.js
rollup -c rollup-config.js

