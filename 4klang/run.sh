yasm -f macho 4klang.asm
gcc -Wl,-no_pie -m32 4klang.o 4klangrender.c -o 4klangrender
./4klangrender | sox -t raw -b 32 -e float -r 44100 -c 2 - -d