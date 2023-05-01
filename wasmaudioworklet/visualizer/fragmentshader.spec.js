import { exportVideo, setupWebGL } from './fragmentshader.js';

describe('fragmentshader', function() {
    this.timeout(20000);
    this.beforeAll(async () => {
        const canvaselement = document.createElement('canvas');
        canvaselement.id = 'glCanvas';
        document.documentElement.appendChild(canvaselement);
    });
    this.afterAll(async () => {
        document.documentElement.removeChild(document.getElementById('glCanvas'));
    });
    it('should export a video from the fragment shader', async () => {
        if (!('VideoEncoder' in window) || /\bHeadlessChrome\//.test(navigator.userAgent)) {
            return;
        }
        const shadersource = `
            precision highp float;
            uniform vec2 resolution;
            uniform float time;
            uniform float targetNoteStates[128];
            
            vec3 hsv2rgb(vec3 c)
            {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            void main(){
            #define product(a, b) vec2(a.x*b.x-a.y*b.y, a.x*b.y+a.y*b.x)
            #define PI 3.1415926538
            float speed = -0.05;
            float t = 2.5 * sin(PI * 3.0/2.0 + time * speed) + 3.2;
            //t = 1.0;
            float res = resolution.x > resolution.y ? resolution.x : resolution.y;
            float scale = (6.0/pow(t,1.0 + t));
            vec2 center = vec2(0.950005,-0.251205);
            vec2 p = (gl_FragCoord.xy - resolution * 0.5) / res * scale;
            
            vec2 z;
            vec2 dc = p - center;
            float radius = sqrt(p.x*p.x+p.y*p.y) / scale;
            float rotation = PI + time * 0.5 - sin(time) * (6.0-t) * radius;
            vec2 c = vec2(p.x*cos(rotation)-p.y*sin(rotation),p.x*sin(rotation)+p.y*cos(rotation)) - center;
            
            float color = 0.0;
            float max_iteration_float = exp(1.0 * sin(PI * 3.0/2.0) + t) * 20.0;
            
            for (int iteration = 0;iteration < 1000;iteration++) {
                z = product(z,z) + c;
                
                color += 1.0;
                if (color >= max_iteration_float) {
                break;
                }
                if (z.x*z.x + z.y*z.y > 4.0) {
                break;
                }
            }
            p.xy = z;
            
            color = (color  / max_iteration_float);
            
            float noteState = 0.0;
            for (int noteStateIndex = 0;noteStateIndex < 128; noteStateIndex++) {
                float ndx = 127.0 * 2.0 * atan(p.y/p.x) / PI;
                
                float dist = 1.0 / (1.0 + abs(float(noteStateIndex) - ndx));
                noteState += dist * (targetNoteStates[noteStateIndex] + 1.0);
            }
            noteState /= 4.0;
            float v = (0.5 * sin(radius * noteState * PI * sin(time * 0.5) * PI * 5.0)) + 0.5;
            
            vec3 rgb = hsv2rgb(vec3(1.0 - color * 1.0,v, 1.0 - color * 1.0 ));	  
            gl_FragColor=vec4(rgb,1);
            }
        `;
        await setupWebGL(shadersource, document.querySelector('canvas'));
        await exportVideo(shadersource,[
            { time: 0, message: [144, 62, 127 ]},
            { time: 1, message: [144, 62, 0 ]},
            { time: 2, message: [144, 65, 127 ]},
            { time: 3, message: [144, 65, 0 ]}            
        ]);
    });
});