#include <stdio.h>
#include <stdlib.h>
#include <signal.h>

extern void _4klang_render(void*) __attribute__ ((stdcall));
extern int _4klang_current_tick;

#define	SAMPLE_RATE	44100
#define	MAX_INSTRUMENTS	9
#define	MAX_VOICES 1
#define	HLD	1 ;	// can be adjusted to give crinkler	some other possibilities
#define	BPM	100
#define	MAX_PATTERNS 62
#define	PATTERN_SIZE_SHIFT 4
#define	PATTERN_SIZE (1	<< PATTERN_SIZE_SHIFT)
#define	MAX_TICKS (MAX_PATTERNS*PATTERN_SIZE)
#define	SAMPLES_PER_TICK (SAMPLE_RATE*4*60/(BPM*16))
#define	DEF_LFO_NORMALIZE 0.000038
#define	MAX_SAMPLES	(SAMPLES_PER_TICK*MAX_TICKS)

volatile sig_atomic_t keep_going = 1;

float buf[SAMPLES_PER_TICK * 2];

void sig_handler(int sig) {
    if(sig==SIGUSR1) {
        keep_going = 0;
        fprintf(stderr,"\nWill exit soon\n");        
    }
}

int main() {
    signal(SIGUSR1, sig_handler);

    FILE *fp;
 
    _4klang_current_tick = 0;

    fp = fdopen(fileno(stdout), "wb");
    for(int n=0;n<MAX_TICKS;n++) {
        if(
            ((n % 16) == 0) &&
            !keep_going) {
            break;
        }

        // fprintf(stderr,"\nRender %d %d\n",n,_4klang_current_tick);
        _4klang_render(buf);
        
        fwrite(buf, sizeof(buf), 1, fp);
    }
    fclose(fp);

    fprintf(stderr,"\nExit");
}