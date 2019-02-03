export class DelayLine {
    readonly bufferPointer: usize;
    index: usize = 0;
    length: usize = 0;

    constructor(length: usize) {       
        this.length = length * 4;
        this.bufferPointer = memory.allocate(this.length);   
    }

    read(): f32 {
        return load<f32>(this.bufferPointer + this.index );
    }

    write_and_advance(value: f32) :void {
        store<f32>(this.bufferPointer + this.index, value);

        if (this.index === this.length - 4) {
            this.index = 0;
        } else {
            this.index+=4;
        }
    }
}