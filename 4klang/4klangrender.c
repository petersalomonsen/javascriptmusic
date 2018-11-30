#include <stdio.h>

extern void _4klang_render(void*) __attribute__ ((stdcall));

#define SAMPLE_RATE	44100
#define MAX_INSTRUMENTS	9
#define MAX_VOICES 1
#define HLD 1
#define BPM 120.000000
#define MAX_PATTERNS 72
#define PATTERN_SIZE_SHIFT 4
#define PATTERN_SIZE (1 << PATTERN_SIZE_SHIFT)
#define	MAX_TICKS (MAX_PATTERNS*PATTERN_SIZE)
#define	SAMPLES_PER_TICK 5512
#define DEF_LFO_NORMALIZE 0.0000453515
#define	MAX_SAMPLES	(SAMPLES_PER_TICK*MAX_TICKS)


float buf[SAMPLES_PER_TICK * 2];

int main() {
    
    
    
    FILE *fp;
 
    fp = fdopen(fileno(stdout), "wb");
    for(int n=0;n<MAX_TICKS;n++) {
        _4klang_render(buf);
        fwrite(buf, sizeof(buf), 1, fp);
    }
    fclose(fp);
}