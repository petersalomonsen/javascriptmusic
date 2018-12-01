const cp = require('child_process');
const fs = require('fs');

let livereloadchild = null;
let childfinishedpromise = null;

const startChild = () => {
    livereloadchild = cp.spawn('./4klangrender', [], {
        stdio: ['pipe', 'inherit', 'inherit','ipc']
    });
    childfinishedpromise = new Promise(resolve =>
        livereloadchild.on('exit', () => resolve())
    );
};

let reloadinprogress = false;
fs.watchFile('./4klang.inc', async (curr, prev) => {
    if(reloadinprogress) {
        return;
    }
    reloadinprogress = true;

    
    const previousLiveReloadChild = livereloadchild;                                   
    cp.execSync('yasm -f macho 4klang.asm');
    cp.execSync('gcc -Wl,-no_pie -m32 4klang.o 4klangrender.c -o 4klangrender');
    previousLiveReloadChild.kill('SIGUSR1');
    await childfinishedpromise;
    
    startChild();
    console.error('RELOAD');
    reloadinprogress = false;
});

startChild();
