#include <stdio.h>
#include <stdlib.h>
#include <signal.h>

#ifdef __linux
extern void __4klang_render(void*) __attribute__ ((stdcall));
extern int __4klang_current_tick;
#define _4klang_current_tick __4klang_current_tick
#define _4klang_render __4klang_render
#else
extern void _4klang_render(void*) __attribute__ ((stdcall));
extern int _4klang_current_tick;
#endif

#define	SAMPLE_RATE	44100
#define	MAX_INSTRUMENTS	9
#define	MAX_VOICES 1
#define	HLD	1 ;	// can be adjusted to give crinkler	some other possibilities
#define	BPM	100
#define	MAX_PATTERNS 96
#define	PATTERN_SIZE_SHIFT 4
#define	PATTERN_SIZE (1	<< PATTERN_SIZE_SHIFT)
#define	MAX_TICKS (MAX_PATTERNS*PATTERN_SIZE)
#define	SAMPLES_PER_TICK (SAMPLE_RATE*4*60/(BPM*16))
#define	DEF_LFO_NORMALIZE 0.000038
#define	MAX_SAMPLES	(SAMPLES_PER_TICK*MAX_TICKS)
#define SINGLE_TICK_RENDERING

#ifdef SINGLE_TICK_RENDERING
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

    for(int n=0;n<MAX_TICKS;n++) {
        if(
            ((n % 16) == 0) &&
            !keep_going) {
            break;
        }

        // fprintf(stderr,"\nRender %d / %d\n",_4klang_current_tick, MAX_TICKS);
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