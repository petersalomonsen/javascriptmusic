; ----------------- Taken from https://keyj.emphy.de/win32-pe/
bits 32
BASE      equ 0x00400000
ALIGNMENT equ 4
SECTALIGN equ 4

%define ROUND(v, a) (((v + a - 1) / a) * a)
%define ALIGNED(v) (ROUND(v, ALIGNMENT))
%define RVA(obj) (obj - BASE)

org BASE

mz_hdr:
    dw "MZ"                       ; DOS magic
    dw "kj"                       ; filler to align the PE header

pe_hdr:
    dw "PE",0                     ; PE magic + 2 padding bytes
    dw 0x014c                     ; i386 architecture
    dw 0                          ; no sections
N_user32: db "user32.dll",0,0  ; 12 bytes of data collapsed into the header
   ;dd 0                          ; [UNUSED-12] timestamp
   ;dd 0                          ; [UNUSED] symbol table pointer
   ;dd 0                          ; [UNUSED] symbol count
    dw 8                          ; optional header size
    dw 0x0102                     ; characteristics: 32-bit, executable

opt_hdr:
    dw 0x010b                     ; optional header magic
main_part_1:  ; 12 bytes of main entry point + 2 bytes of jump
    mov eax, [fs:0x30]     ; get PEB pointer from TEB
    mov eax, [eax+0x0C]    ; get PEB_LDR_DATA pointer from PEB
    mov eax, [eax+0x14]    ; go to first LDR_DATA_TABLE_ENTRY
    jmp main_part_2
    align 4, db 0
   ;db 13,37                      ; [UNUSED-14] linker version
   ;dd RVA(the_end)               ; [UNUSED] code size
   ;dd RVA(the_end)               ; [UNUSED] size of initialized data
   ;dd 0                          ; [UNUSED] size of uninitialized data
    dd RVA(main_part_1)           ; entry point address
main_part_2:  ; another 6 bytes of code + 2 bytes of jump
    ; set up stack frame for local variables
    push ebp
    %define DummyVar      ebp-4
    %define kernel32base  ebp-8
    %define user32base    ebp-12
    sub esp, 12
    mov eax, [eax]         ; go to where ntdll.dll typically is
    jmp main_part_3
    align 4, db 0
   ;dd RVA(main)                  ; [UNUSED-8] base of code
   ;dd RVA(main)                  ; [UNUSED] base of data
    dd BASE                       ; image base
    dd SECTALIGN                  ; section alignment (collapsed with the
                                  ; PE header offset in the DOS header)
    dd ALIGNMENT                  ; file alignment
main_part_3:  ; another 5 bytes of code + 2 bytes of jump
    mov eax, [eax]         ; go to where kernel32.dll typically is
    mov ebx, [eax+0x10]    ; load base address of the library
    jmp main_part_4
    align 4, db 0
   ;dw 4,0                        ; [UNUSED-8] OS version
   ;dw 0,0                        ; [UNUSED] image version
    dw 4,0                        ; subsystem version
    dd 0                          ; [UNUSED-4] Win32 version
    dd RVA(the_end)               ; size of image
    dd RVA(opt_hdr)               ; size of headers (must be small enough
                                  ; so that entry point inside header is accepted)
    dd 0                          ; [UNUSED-4] checksum
    dw 3                          ; subsystem = console
    dw 0                          ; [UNUSED-2] DLL characteristics
    dd 0x00100000                 ; maximum stack size
    dd 0x00001000                 ; initial stack size
    dd 0x00100000                 ; maximum heap size
    dd 0x00001000                 ; initial heap size
    dd 0                          ; [UNUSED-4] loader flags
    dd 0                          ; number of data directory entries (= none!)
OPT_HDR_SIZE equ $ - opt_hdr
ALL_HDR_SIZE equ $ - $$

main_part_4:
    mov [kernel32base], ebx  ; store kernel32's base address
    jmp the_main

%include "4klang.asm"

the_main:
    ; -------- open stdout handle

    push -11
    mov esi, 0xEACA71C2;
    call call_import;

    mov [stdouthandle],eax;

    ; -------- print welcome

    push 0              ; lpOverlapped = NULL
    lea edx, [DummyVar] ; lpBytesWritten
    push edx
    mov ecx, welcome_end-welcome
    push ecx            ; nNumberOfBytesToWrite = strledn(str)
    mov edx, welcome
    push edx            ; buf

    mov eax, [stdouthandle]     
    push eax
    
    mov esi, 0x3FD1C30F ; hash of "WriteFile"
    call call_import

    ; -------- open output wav file
    push 0;
    push 2; overwrite    
    push 0;
    push 0x40000000; generic write
    mov eax, output_file_name;
    push eax;    
    
    mov ebx, [kernel32base]
    mov esi, 0x9c23e3c5 ; hash of "CreateFile2"
    call call_import    ;     ... CreateFile2
    
    mov [outputfilehandle], eax
    ; ------- write wav header
    push 0              ; lpOverlapped = NULL
    lea edx, [DummyVar] ; lpBytesWritten
    push edx
    mov ecx, wav_header_end - wav_header;
    push ecx            ; nNumberOfBytesToWrite = strledn(str)
    mov edx, wav_header;
    push edx            ; buf
    push eax
    
    mov esi, 0x3FD1C30F ; hash of "WriteFile"
    call call_import

    ; ------------ Loop render audio, tick by tick

render_loop:
        ; ------------- 4klang

        mov eax, render_buf
        push eax
        call __4klang_render

        ; ------------- write audio
        push 0              ; lpOverlapped = NULL
        lea edx, [DummyVar] ; lpBytesWritten
        push edx
        mov ecx, render_buf_end - render_buf;
        push ecx            ; nNumberOfBytesToWrite = strledn(str)
        mov edx, render_buf;
        push edx            ; buf
        mov eax, [outputfilehandle]
        push eax

        mov ebx, [kernel32base]  ; store kernel32's base address    
        mov esi, 0x3FD1C30F ; hash of "WriteFile"
        call call_import

        ; -------- print progress

        mov eax, [__4klang_current_tick];

        ; clear output
        mov ebx, 0x25000030
        
        ; third digit
        or eax, 0
        jnz not_finished

        or  ebx, 0x01
not_finished:
        ; calc percentage
        mov ecx, 100
        mul ecx
        mov ecx, MAX_TICKS
        div ecx
        
        ; first digit
        mov edx, 0
        mov ecx, 10
        div ecx
        add edx, 0x30
        shl edx, 16
        or  ebx, edx
        
        ; second digit
        mov edx, 0
        mov ecx, 10
        div ecx
        add edx, 0x30
        shl edx, 8
        or  ebx, edx

        mov [rendering_msg_percent], ebx

        push 0              ; lpOverlapped = NULL
        lea edx, [DummyVar] ; lpBytesWritten
        push edx
        mov ecx, rendering_msg_end-rendering_msg
        push ecx            ; nNumberOfBytesToWrite = strledn(str)
        mov edx, rendering_msg
        push edx            ; buf

        mov eax, [stdouthandle]     
        push eax
        
        mov esi, 0x3FD1C30F ; hash of "WriteFile"
        mov ebx, [kernel32base]  ; store kernel32's base address    
        call call_import

        ; ------- check for song end
        mov eax, [__4klang_current_tick]
        or eax, 0
        jnz render_loop

    ; ------- exit

    ; ExitProcess(0);
    push 0
    jmp exit
error:
    push 1
exit:
    mov ebx, [kernel32base]
    mov esi, 0x665640AC ; hash of "ExitProcess"
    ; fall-through into call_import


call_import:  ; FUNCTION that calls procedure [esi] in library at base [ebx]
    mov edx, [ebx+0x3c]    ; get PE header pointer (w/ RVA translation)
    add edx, ebx
    mov edx, [edx+0x78]    ; get export table pointer RVA (w/ RVA translation)
    add edx, ebx
    push edx               ; store the export table address for later
    mov ecx, [edx+0x18]    ; ecx = number of named functions
    mov edx, [edx+0x20]    ; edx = address-of-names list (w/ RVA translation)
    add edx, ebx
name_loop:
    push esi               ; store the desired function name's hash (we will clobber it)
    mov edi, [edx]         ; load function name (w/ RVA translation)
    add edi, ebx
cmp_loop:
    movzx eax, byte [edi]  ; load a byte of the name ...
    inc edi                ; ... and advance the pointer
    xor esi, eax           ; apply xor-and-rotate
    rol esi, 7
    or eax, eax            ; last byte?
    jnz cmp_loop           ; if not, process another byte
    or esi, esi            ; result hash match?
    jnz next_name          ; if not, this is not the correct name
    ; if we arrive here, we have a match!
    pop esi                ; restore the name pointer (though we don't use it any longer)
    pop edx                ; restore the export table address
    sub ecx, [edx+0x18]    ; turn the negative counter ECX into a positive one
    neg ecx
    mov eax, [edx+0x24]    ; get address of ordinal table (w/ RVA translation)
    add eax, ebx
    movzx ecx, word [eax+ecx*2]  ; load ordinal from table
    ;sub ecx, [edx+0x10]    ; subtract ordinal base
    mov eax, [edx+0x1C]    ; get address of function address table (w/ RVA translation)
    add eax, ebx
    mov eax, [eax+ecx*4]   ; load function address (w/ RVA translation)
    add eax, ebx
    jmp eax                ; jump to the target function
next_name:
    pop esi                ; restore the name pointer
    add edx, 4             ; advance to next list item
    dec ecx                ; decrease counter
    jmp name_loop

welcome: db "Peter Salomonsen - 4klang first attempt (2019)",10,13
welcome_end:
rendering_msg: db "Creating wav file "
rendering_msg_percent: db "000%",13
rendering_msg_end:
output_file_name: dw 0x0070,0x0065,0x0074,0x0065,0x0072,0x0073,0x0061,0x006c,0x006f,0x006d,0x006f,0x006e,0x0073,0x0065,0x006e,0x005f,0x0034,0x006b,0x006c,0x0061,0x006e,0x0067,0x005f,0x0066,0x0069,0x0072,0x0073,0x0074,0x005f,0x0061,0x0074,0x0074,0x0065,0x006d,0x0070,0x0074,0x002e,0x0077,0x0061,0x0076,0

wav_header:
    db 0x52, 0x49, 0x46, 0x46, 0x24, 0x08, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x02, 0x00, 
    db 0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x04, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61
    dd MAX_SAMPLES * 2 * 2
wav_header_end:

section .bss
outputfilehandle:
    resb 4
stdouthandle:
    resb 4
render_buf:  resb SAMPLES_PER_TICK * 2 * 2 
render_buf_end:
align ALIGNMENT, db 0
the_end: