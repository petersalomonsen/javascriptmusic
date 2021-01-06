let stdout;
let stderr;
let captureOutput = false;
let currentRepoRootDir;

var Module = {
  locateFile: function (s) {
    return 'https://unpkg.com/wasm-git@0.0.4/' + s;
  },
  'print': function (text) {
    if (captureOutput) {
      stdout += text + '\n';
    }
    console.log(text);
  },
  'printErr': function (text) {
    if (captureOutput) {
      stderr += text + '\n';
    }
    console.error(text);
  }
};

let accessToken = 'ANONYMOUS';
XMLHttpRequest.prototype._open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
  this._open(method, url, async, user, password);
  this.setRequestHeader('Authorization', `Bearer ${accessToken}`);
}
importScripts('https://unpkg.com/wasm-git@0.0.4/lg2.js');

function writeGlobalConfig(username, useremail) {
  FS.writeFile('/home/web_user/.gitconfig', '[user]\n' +
    `name = ${username}\n` +
    `email = ${useremail}`);

}

const lgPromise = new Promise(resolve => {
  Module.onRuntimeInitialized = () => {
    writeGlobalConfig('Test user', 'test@example.com');
    resolve(Module);
  }
});

onmessage = async (msg) => {
  const lg = await lgPromise;

  function callAndCaptureOutput(args) {
    captureOutput = true;
    stderr = '';
    stdout = '';
    lg.callMain(args);
    captureOutput = false;
    if (stderr) {
      throw new Error(stderr);
    }
  }

  function repoHasChanges() {
    callAndCaptureOutput(['status']);

    if (stdout.indexOf('Changes to be committed:') > -1) {
      return true;
    } else {
      return false;
    }
  }

  if (msg.data.accessToken) {
    accessToken = msg.data.accessToken;
    writeGlobalConfig(msg.data.username, msg.data.useremail);
    postMessage({ accessTokenConfigured: true });
  } else if (msg.data.command === 'writefileandstage') {
    FS.writeFile(msg.data.filename, msg.data.contents);
    lg.callMain(['add', '--verbose', msg.data.filename]);
    FS.syncfs(false, () => {
      console.log(currentRepoRootDir, 'stored to indexeddb');
      postMessage({ dircontents: FS.readdir('.'), repoHasChanges: repoHasChanges() });
    });
  } else if (msg.data.command === 'discardchanges') {
    lg.callMain(['checkout', '--'].concat(msg.data.filenames));
    FS.syncfs(false, () => {
      console.log(currentRepoRootDir, 'stored to indexeddb');
      postMessage({ dircontents: FS.readdir('.'), repoHasChanges: repoHasChanges() });
    });
  } else if (msg.data.command === 'repohaschanges') {
    postMessage({ repohaschanges: repoHasChanges() });
  } else if (msg.data.command === 'commitpullpush') {
    if (repoHasChanges()) {
      lg.callMain(['commit', '-m', msg.data.commitmessage]);
    }

    let err = null;
    try {
      callAndCaptureOutput(['fetch', 'origin']);
      if (stdout.indexOf('Received 0/0 objects') === -1) {
        callAndCaptureOutput(['merge', 'origin/master']);
      }
      callAndCaptureOutput(['push']);
    } catch (e) {
      err = e;
    }
    FS.syncfs(false, () => {
      console.log(currentRepoRootDir, 'stored to indexeddb');
      postMessage({ id: msg.data.id, error: err ? err.message : undefined, dircontents: FS.readdir('.') });
    });
  } else if (msg.data.command === 'synclocal') {
    currentRepoRootDir = msg.data.url.substring(msg.data.url.lastIndexOf('/') + 1);
    console.log('synclocal', currentRepoRootDir);

    FS.mkdir(`/${currentRepoRootDir}`);
    FS.mount(IDBFS, {}, `/${currentRepoRootDir}`);

    FS.syncfs(true, () => {
      if (FS.readdir(`/${currentRepoRootDir}`).find(file => file === '.git')) {
        FS.chdir(`/${currentRepoRootDir}`);
        postMessage({ dircontents: FS.readdir('.') });
        console.log(currentRepoRootDir, 'restored from indexeddb');
      } else {
        FS.chdir('/');
        console.log('no git repo in', currentRepoRootDir);
        postMessage({ dircontents: null });
      }
    });
  } else if (msg.data.command === 'deletelocal') {
    FS.unmount(`/${currentRepoRootDir}`);
    console.log('deleting database', currentRepoRootDir);
    self.indexedDB.deleteDatabase('/' + currentRepoRootDir);
    postMessage({ id: msg.data.id, deleted: currentRepoRootDir });
  } else if (msg.data.command === 'clone') {
    currentRepoRootDir = msg.data.url.substring(msg.data.url.lastIndexOf('/') + 1);

    lg.callMain(['clone', msg.data.url, currentRepoRootDir]);
    FS.chdir(currentRepoRootDir);

    FS.syncfs(false, () => {
      console.log(currentRepoRootDir, 'stored to indexeddb');
      postMessage({ dircontents: FS.readdir('.') });
    });
  } else if (msg.data.command === 'diff') {
    callAndCaptureOutput(['status']);
    if (stdout.indexOf('On branch Not currently on any branch') === -1) {
      callAndCaptureOutput(['diff', 'master']);
    }
    postMessage({ diff: stdout });
  } else if (msg.data.command === 'pull') {
    lg.callMain(['fetch', 'origin']);
    lg.callMain(['merge', 'origin/master']);
    FS.syncfs(false, () => {
      console.log(currentRepoRootDir, 'stored to indexeddb');
      postMessage({ dircontents: FS.readdir('.') });
    });
  } else if (msg.data.command === 'readfile') {
    try {
      postMessage({
        filename: msg.data.filename,
        filecontents: FS.readFile(msg.data.filename, { encoding: 'utf8' })
      });
    } catch (e) {
      postMessage({ 'error': JSON.stringify(e) });
    }
  } else if (msg.data.command === 'log') {
    callAndCaptureOutput(['log']);
    postMessage({ log: stdout });
  } else {
    lg.callMain([msg.data.command]);
  }
};