#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include "4klang.h"

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
float buf[SAMPLES_PER_TICK * 2];

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
    fp = fdopen(fileno(stdout), "wb");
    
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
        
//         fprintf(stderr,"\nRender %d / %d, %ld\n",_4klang_current_tick, MAX_TICKS, elapsed);
        _4klang_render(buf);
        
        fwrite(buf, sizeof(buf), 1, fp);

        
    }
#else
    _4klang_render(buf);
    fwrite(buf, sizeof(buf), 1, fp);
#endif
    fclose(fp);

    fprintf(stderr,"\nExit");
}