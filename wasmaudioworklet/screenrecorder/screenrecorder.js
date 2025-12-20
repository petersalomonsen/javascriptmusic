import { isCameraActive } from './cameraviewer.js';

let mediaRecorder;
let captureStream;
let audioStreamDestination;

export async function startVideoRecording(audioContext, audioNodeToRecord = null) {
    try {
        const videostream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        });

        audioStreamDestination = audioContext.createMediaStreamDestination();
        
        if (audioNodeToRecord) {
            // Add a compressor/limiter to prevent the synth from clipping and drowning out the mic
            const synthCompressor = audioContext.createDynamicsCompressor();
            synthCompressor.threshold.value = -6;  // Start compressing at -6dB
            synthCompressor.knee.value = 3;
            synthCompressor.ratio.value = 12;      // Heavy compression to tame peaks
            synthCompressor.attack.value = 0.003;  // Fast attack to catch transients
            synthCompressor.release.value = 0.1;
            
            const synthGain = audioContext.createGain();
            synthGain.gain.value = 0.7;  // Reduce synth level to leave headroom for voice
            
            audioNodeToRecord.connect(synthCompressor);
            synthCompressor.connect(synthGain);
            synthGain.connect(audioStreamDestination);
        } else {
            // need at least one node connected in order to keep in sync with the video
            audioContext.createGain().connect(audioStreamDestination);
        }

        if (isCameraActive()) {
            // Request stereo mic input
            const micstream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 2,
                    echoCancellation: false,  // Disable for better quality when singing
                    noiseSuppression: false,  // Disable to preserve vocal dynamics
                    autoGainControl: false    // Disable to have manual control
                }, 
                video: false 
            });
            const micsource = audioContext.createMediaStreamSource(new MediaStream(micstream.getAudioTracks()));
            const micgain = audioContext.createGain();
            micgain.gain.value = 1.5;  // Boost mic to compete with synth
            micsource.connect(micgain);
            micgain.connect(audioStreamDestination);
        }

        const tracks = [
            ...videostream.getVideoTracks(),
            ...audioStreamDestination.stream.getAudioTracks()
        ];
        captureStream = new MediaStream(tracks);

        mediaRecorder = new MediaRecorder(captureStream);
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                var blob = new Blob([event.data], {
                    type: "video/webm"
                });
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = "test.webm";
                a.click();
                window.URL.revokeObjectURL(url);
            }
        };
        mediaRecorder.start();
    } catch (err) {
        console.error("Error: " + err);
    }
}

export function recordAudioNode(audioNodeToRecord) {
    if (audioStreamDestination) {
        audioNodeToRecord.connect(audioStreamDestination);
    }
}

export function stopVideoRecording() {
    captureStream.getVideoTracks().forEach(t => t.stop());
    mediaRecorder.stop();
    audioStreamDestination = null;
}
