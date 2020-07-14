import { StereoSignal } from "./stereosignal.class";

const HALF_OF_SQRT_2 = NativeMathf.sqrt(2) / 2;

export class Pan {
    leftLevel: f32;
    rightLevel: f32;
    
    constructor() {
        this.setPan(0.5);    
    }

    /**
     * Don't use as part of the rendering process. Use to calculate pan levels on controller changes
     * @param pan from 0.0 (left) to 1.0 (right). 0.5 is center
     */
    setPan(pan: f32): void {
        const angle = (pan - 0.5) * NativeMathf.PI / 2;
        // left channel
        this.leftLevel = HALF_OF_SQRT_2 * (NativeMathf.cos(angle) - NativeMathf.sin(angle));
        // right channel
        this.rightLevel = HALF_OF_SQRT_2 * (NativeMathf.cos(angle) + NativeMathf.sin(angle));
    }
}
