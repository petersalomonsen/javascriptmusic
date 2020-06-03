let stdout;
let stderr;
let captureOutput = false;

var Module = {
    locateFile: function(s) {
      return 'https://unpkg.com/wasm-git@0.0.2/' + s;
    },
    'print': function(text) {   
      if (captureOutput) {
        stdout += text;
      }   
      console.log(text);
    },
    'printErr': function(text) {    
      if (captureOutput) {
        stderr += text;
      }     
      console.error(text);
    }
};

let accessToken = 'ANONYMOUS';
XMLHttpRequest.prototype._open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
  this._open(method, url, async, user, password);
  this.setRequestHeader('Authorization', `Bearer ${accessToken}`);
}
importScripts('https://unpkg.com/wasm-git@0.0.2/lg2.js');

function writeGlobalConfig(username, useremail) {
  FS.writeFile('/home/web_user/.gitconfig', '[user]\n' +
                `name = ${username}\n` +
                `email = ${useremail}`);

}

Module.onRuntimeInitialized = () => {
    const lg = Module;

    function callAndCaptureOutput(args) {
      captureOutput = true;
      stderr = '';
      stdout = '';
      lg.callMain(args);
      captureOutput = false;
    }
    
    function repoHasChanges() {
      callAndCaptureOutput(['status']);
      
      if (stdout.indexOf('Changes to be committed:') > -1) {
        return true;
      } else {
        return false;
      }
    }

    writeGlobalConfig('Test user', 'test@example.com');

    let currentRepoRootDir;

    onmessage = (msg) => {
      if (msg.data.accessToken) {
        accessToken = msg.data.accessToken;
        writeGlobalConfig(msg.data.username, msg.data.useremail);
      } else if(msg.data.command === 'writefileandstage') {
        FS.writeFile(msg.data.filename, msg.data.contents);
        lg.callMain(['add', '--verbose', msg.data.filename]);
        FS.syncfs(false, () => {
          console.log(currentRepoRootDir, 'stored to indexeddb');
          postMessage({ dircontents: FS.readdir('.'), repoHasChanges: repoHasChanges() });
        });
      } else if (msg.data.command === 'repohaschanges') {
        postMessage({repohaschanges: repoHasChanges()});
      } else if (msg.data.command === 'commitpullpush') {
        if (repoHasChanges()) {
          lg.callMain(['commit','-m', msg.data.commitmessage]);
        }

        lg.callMain(['fetch', 'origin']);
        lg.callMain(['merge', 'origin/master']);
        lg.callMain(['push']);
        FS.syncfs(false, () => {
          console.log(currentRepoRootDir, 'stored to indexeddb');
          postMessage({ dircontents: FS.readdir('.') });
        });      
      } else if (msg.data.command === 'synclocal') {
        currentRepoRootDir = msg.data.url.substring(msg.data.url.lastIndexOf('/') + 1);
        console.log('synclocal', currentRepoRootDir);

        FS.mkdir(`/${currentRepoRootDir}`);
        FS.mount(IDBFS, { }, `/${currentRepoRootDir}`);
        
        FS.syncfs(true, () => {          
          if( FS.readdir(`/${currentRepoRootDir}`).find(file => file === '.git') ) {
            FS.chdir( `/${currentRepoRootDir}` );
            postMessage({ dircontents: FS.readdir('.') });
            console.log(currentRepoRootDir, 'restored from indexeddb');
          } else {
            FS.chdir( '/' );
            console.log('no git repo in', currentRepoRootDir);
            postMessage({ dircontents: null });
          }
        });
      } else if (msg.data.command === 'deletelocal') {
        
        FS.unmount(`/${currentRepoRootDir}`);
        console.log('deleting database', currentRepoRootDir);
        self.indexedDB.deleteDatabase('/' + currentRepoRootDir);
        postMessage({ deleted: currentRepoRootDir});
      } else if (msg.data.command === 'clone') {
        currentRepoRootDir = msg.data.url.substring(msg.data.url.lastIndexOf('/') + 1);
        
        lg.callMain(['clone', msg.data.url, currentRepoRootDir]);
        FS.chdir(currentRepoRootDir);

        FS.syncfs(false, () => {
          console.log(currentRepoRootDir, 'stored to indexeddb');
          postMessage({ dircontents: FS.readdir('.') });
        });        
      } else if (msg.data.command === 'pull') {
        lg.callMain(['fetch', 'origin']);
        lg.callMain(['merge', 'origin/master']);
        FS.syncfs(false, () => {
          console.log(currentRepoRootDir, 'stored to indexeddb');
          postMessage({ dircontents: FS.readdir('.') });
        });
      } else if (msg.data.command === 'readfile') {
        try {
          postMessage({
            filename: msg.data.filename,
            filecontents: FS.readFile(msg.data.filename, {encoding: 'utf8'})
          });
        } catch (e) {
          postMessage({'stderr': JSON.stringify(e)});
        }
      } else {
        lg.callMain([msg.data.command]);
      }
    };

    postMessage({'ready': true});
};