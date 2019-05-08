const instr = `GO4K_ENV	ATTAC(88),DECAY(88),SUSTAIN(88),RELEASE(88),GAIN(88)
GO4K_VCO	TRANSPOSE(76),DETUNE(64),PHASE(64),GATES(85),COLOR(64),SHAPE(64),GAIN(64),FLAGS(SINE|LFO)
GO4K_FST	AMOUNT(70),DEST(5*MAX_UNIT_SLOTS+2+FST_SET)
GO4K_FST	AMOUNT(70),DEST(6*MAX_UNIT_SLOTS+5+FST_SET)
GO4K_FOP	OP(FOP_POP)
GO4K_VCO	TRANSPOSE(64),DETUNE(65),PHASE(64),GATES(85),COLOR(52),SHAPE(64),GAIN(64),FLAGS(TRISAW)
GO4K_VCO	TRANSPOSE(64),DETUNE(63),PHASE(64),GATES(85),COLOR(52),SHAPE(64),GAIN(64),FLAGS(TRISAW)
GO4K_FOP	OP(FOP_ADDP)
GO4K_FOP	OP(FOP_MULP)
GO4K_PAN	PANNING(64)
GO4K_OUT	GAIN(0), AUXSEND(128)`;

const lines = instr.split('\n');

let stackIndex = 0;
let maxStackIndex = 0;

lines.forEach((line, ndx) => {
    const parts = line.split('\t');
    const cmd = parts[0];
    let tsline;
    
    const declareVarFunc = () => stackIndex===maxStackIndex ? `let f_${stackIndex++}:f32`: `f_${stackIndex++}`;

    switch(cmd) {
        case 'GO4K_ENV':
            tsline = `${declareVarFunc()} = this.env${ndx}.next();`;
            break;
        case 'GO4K_VCO':
            tsline = `${declareVarFunc()} = this.vco${ndx}.next();`;
            break;
        case 'GO4K_FST':
            tsline = `FST(f_${stackIndex-1});`;
            break;
        case 'GO4K_PAN':
            tsline = `${declareVarFunc()} = f_${stackIndex - 2}`;
            stackIndex++;
            break;
        case 'GO4K_OUT':
            tsline = `this.signal.left = f_1;\nthis.signal.right = f_0;`;
        case 'GO4K_FOP':
            switch(parts[1]) {
                case 'OP(FOP_POP)':
                    stackIndex--;
                    break;
                case 'OP(FOP_ADDP)':
                    stackIndex--;
                    tsline = `f_${stackIndex-1} += f_${stackIndex};`;                    
                    break;
                case 'OP(FOP_MULP)':
                    stackIndex--;
                    tsline = `f_${stackIndex-1} *= f_${stackIndex};`;                    
                    break;
            }
            break;
    }
    if(stackIndex > maxStackIndex) {
        maxStackIndex = stackIndex;
    }
    console.log(`${tsline} // ${line}`);
});
