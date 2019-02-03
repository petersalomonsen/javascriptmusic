#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include "4klang.h"

#ifdef _WIN32
#define SIGUSR1 SIGABRT
#endif

#ifdef __linux
extern void __4klang_render(void*) __attribute__ ((stdcall));
extern int __4klang_current_tick;
#define _4klang_current_tick __4klang_current_tick
#define _4klang_render __4klang_render
#else
extern void _4klang_render(void*) __attribute__ ((stdcall));
extern int _4klang_current_tick;
#endif

#ifdef SINGLE_TICK_RENDERING
#include <time.h>
volatile sig_atomic_t keep_going = 1;
#ifdef _WIN32
char buf[SAMPLES_PER_TICK * 2 * 2];
#else
float buf[SAMPLES_PER_TICK * 2];
#endif

void sig_handler(int sig) {
    if(sig==SIGUSR1) {
        keep_going = 0;
        fprintf(stderr,"\nWill exit soon\n");        
    }
}
#else
float buf[MAX_SAMPLES * 2];
#endif

int main() {
    FILE *fp;
    #ifdef _WIN32
    fprintf(stderr,"\n4klang - First Attempt - composed by Peter Salomonsen in the year 2019\r\n");
    const char * filename = "petersalomonsen_4klangfirstattempt.wav";
    fprintf(stderr,"\nWriting to wav file %s\r\n\n", filename);
    fp = fopen(filename, "wb");
    const unsigned int bytelength = MAX_SAMPLES * 2 * 2;
    char header[] = {0x52, 0x49, 0x46, 0x46, 0x24, 0x08, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x02, 0x00, 
        0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x04, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61,
        bytelength & 0xff, (bytelength >> 8) & 0xff, (bytelength >> 16) & 0xff, (bytelength >> 24) & 0xff};
    fwrite(header, sizeof(header), 1, fp);
    #else
    fp = fdopen(fileno(stdout), "wb");
    #endif
    
#ifdef SINGLE_TICK_RENDERING
    signal(SIGUSR1, sig_handler);
    _4klang_current_tick = 0;

    time_t starttime = time(NULL);
    for(int n=0;n<MAX_TICKS;n++) {
        if(
            ((n % 16) == 0) &&
            !keep_going) {
            break;
        }

        time_t elapsed = time(NULL) - starttime;
        
        #ifdef _WIN32
        fprintf(stderr,"Rendering tick %d / %d, elapsed time: %ld seconds\r",_4klang_current_tick, MAX_TICKS, elapsed);
        #endif
        _4klang_render(buf);
        
        fwrite(buf, sizeof(buf), 1, fp);
    }
#else
    _4klang_render(buf);
    fwrite(buf, sizeof(buf), 1, fp);
#endif
    fclose(fp);

    fprintf(stderr,"\nDone");
}