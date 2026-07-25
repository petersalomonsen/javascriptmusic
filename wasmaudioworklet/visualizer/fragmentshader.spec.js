import { exportVideo, setupWebGL } from './fragmentshader.js';
import { setVisualParamSchedule } from './visualparams.js';
import { compileSong, addedVideo } from '../midisequencer/songcompiler.js';

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
    // Must run before the export test: exportVideo leaves the module in
    // "exporting" mode, which stops all render loops.
    it('should set song-scheduled visual params as shader uniforms', async () => {
        const canvaselement = document.createElement('canvas');
        canvaselement.width = 64;
        canvaselement.height = 64;
        document.documentElement.appendChild(canvaselement);

        setVisualParamSchedule([
            { time: 0, name: 'textTransition', value: 2 },
            { time: 0, name: 'zoom', value: 1 },
            { time: 1000, name: 'zoom', value: 3, ramp: 1000 },
        ]);

        const shadersource = `
            precision highp float;
            uniform float textTransition;
            uniform float zoom;
            uniform sampler2D uText;
            uniform float uTextMix;
            void main() {
                gl_FragColor = vec4(textTransition, zoom, uTextMix * texture2D(uText, vec2(0.5)).a, 1.0);
            }
        `;
        // song time 1.5s — halfway into the zoom ramp
        setupWebGL(shadersource, canvaselement, () => 1.5);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const gl = canvaselement.getContext('webgl');
        const program = gl.getParameter(gl.CURRENT_PROGRAM);
        const uniform = name => gl.getUniform(program, gl.getUniformLocation(program, name));
        expect(uniform('textTransition')).to.equal(2);
        expect(uniform('zoom')).to.be.closeTo(2, 1e-6);
        // the text layer binds even with no text scheduled
        expect(uniform('uText')).to.equal(2);
        expect(uniform('uTextMix')).to.equal(1);

        setVisualParamSchedule([]);
        document.documentElement.removeChild(canvaselement);
    });
    it('should render text scheduled by showText into the uText layer', async () => {
        const canvaselement = document.createElement('canvas');
        canvaselement.width = 160;
        canvaselement.height = 90;
        document.documentElement.appendChild(canvaselement);

        await compileSong(`
            setBPM(120);
            showText('IIIIIIII', { fade: 2 });
            await createTrack(0).steps(4, [c3,,,,]);
            loopHere();
        `);
        // the text image is an SVG data url — wait for the browser to decode it
        await Promise.all(Object.values(addedVideo)
            .filter(vid => vid.layer === 'text')
            .map(vid => vid.imageElement.decode()));

        const shadersource = `
            precision highp float;
            uniform vec2 resolution;
            uniform sampler2D uText;
            uniform sampler2D uTextPrev;
            uniform float uTextMix;
            void main() {
                vec2 uv = gl_FragCoord.xy / resolution;
                float a = texture2D(uText, vec2(uv.x, 1.0 - uv.y)).a
                        + 0.0 * texture2D(uTextPrev, uv).a;
                gl_FragColor = vec4(vec3(a * uTextMix), 1.0);
            }
        `;
        // 1s into a 2s fade
        setupWebGL(shadersource, canvaselement, () => 1.0);
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

        const gl = canvaselement.getContext('webgl');
        const program = gl.getParameter(gl.CURRENT_PROGRAM);
        expect(gl.getUniform(program, gl.getUniformLocation(program, 'uTextMix'))).to.be.closeTo(0.5, 1e-6);

        // draw once more and read it back before the compositor clears
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        const pixels = new Uint8Array(160 * 90 * 4);
        gl.readPixels(0, 0, 160, 90, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        let lit = 0;
        for (let ndx = 0; ndx < pixels.length; ndx += 4) {
            if (pixels[ndx] > 0) lit++;
        }
        // the glyphs cover a small part of the frame, at half opacity
        expect(lit).to.be.greaterThan(20);
        expect(lit).to.be.lessThan(160 * 90 * 0.5);

        document.documentElement.removeChild(canvaselement);
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
        window.showSaveFilePicker = () => ({createWritable: () => ({
            write: () => null,
            close: () => null
        })});
        await exportVideo(shadersource,[
            { time: 0, message: [144, 62, 127 ]},
            { time: 1, message: [144, 62, 0 ]},
            { time: 2, message: [144, 65, 127 ]},
            { time: 3, message: [144, 65, 0 ]}            
        ]);
    });
});