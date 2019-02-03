node 4klang.inc.js
./yasm.exe -f elf32 4klang.asm
gcc -s -O3 -m32 4klang.o 4klangrender.c -o 4klangrender
./yasm.exe -f bin tiny.asm -o tiny.exe
