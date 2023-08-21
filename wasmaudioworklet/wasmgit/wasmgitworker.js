let stdout;
let stderr;
let captureOutput = false;
let currentRepoRootDir;
const CONFIG_FILE = 'wasmmusic.config.json';
const WASM_GIT_BASE_URL = 'https://unpkg.com/wasm-git@0.0.11/';

var Module = {
  locateFile: function (s) {
    return WASM_GIT_BASE_URL + s;
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
let username = 'ANONYMOUS';
let useremail = 'anonymous';
let lastHttpRequest;
XMLHttpRequest.prototype._open = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
  this._open(method, url, async, user, password);
  this.setRequestHeader('Authorization', `Bearer ${accessToken}`);
  lastHttpRequest = this;
}
importScripts(WASM_GIT_BASE_URL + 'lg2.js');

const lgPromise = new Promise(resolve => {
  Module.onRuntimeInitialized = () => {
    resolve(Module);
  }
});

async function persistChanges() {
  await new Promise((resolve) => FS.syncfs(false, () => resolve));
}

async function changeConfig(configPatch) {
  const config = JSON.parse(FS.readFile(CONFIG_FILE, { encoding: 'utf8' }));
  Object.assign(config, configPatch);
  FS.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
  await persistChanges();
}

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
    try {
      callAndCaptureOutput(['status']);
    } catch (e) {

    }
    if (stdout.indexOf('Changes to be committed:') > -1) {
      return true;
    } else {
      return false;
    }
  }

  if (msg.data.accessToken) {
    accessToken = msg.data.accessToken;
    username = msg.data.username;
    useremail = msg.data.useremail;
    postMessage({ accessTokenConfigured: true });
  } else if (msg.data.command === 'writefileandstage') {
    FS.writeFile(msg.data.filename, msg.data.contents);
    lg.callMain(['add', '--verbose', msg.data.filename]);
    FS.syncfs(false, () => {
      console.log(currentRepoRootDir, 'stored to indexeddb');
      postMessage({ dircontents: FS.readdir('.'), repoHasChanges: repoHasChanges() });
    });
  } else if (msg.data.command === 'dir') {
    postMessage({ id: msg.data.id, dircontents: FS.readdir('.') });
  } else if (msg.data.command === 'repohaschanges') {
    postMessage({ repohaschanges: repoHasChanges() });
  } else if (msg.data.command === 'commitpullpush') {
    if (repoHasChanges()) {
      callMain(['config', 'user.name', username]);
      callMain(['config', 'user.email', useremail]);

      lg.callMain(['commit', '-m', msg.data.commitmessage]);
    }

    let err = null;
    lastHttpRequest = null;
    try {
      callAndCaptureOutput(['fetch', 'origin']);
      if (stdout.indexOf('Received 0/0 objects') === -1) {
        callAndCaptureOutput(['merge', 'origin/master']);
      }
      callAndCaptureOutput(['push']);
    } catch (e) {
      err = e.message;
      if (lastHttpRequest) {
        err += ` http status: ${lastHttpRequest.status}`;
      }
    }
    FS.syncfs(false, () => {
      console.log(currentRepoRootDir, 'stored to indexeddb');
      postMessage({ id: msg.data.id, error: err ? err : undefined, dircontents: FS.readdir('.') });
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
    try {
      callAndCaptureOutput(['status']);
      if (stdout.indexOf('On branch Not currently on any branch') === -1) {
        callAndCaptureOutput(['diff', 'master']);
      }
    } catch (e) {

    }
    postMessage({ diff: stdout });
  } else if (msg.data.command === 'pull') {
    lg.callMain(['fetch', 'origin']);
    lg.callMain(['merge', 'origin/master']);
    FS.syncfs(false, () => {
      console.log(currentRepoRootDir, 'stored to indexeddb');
      postMessage({ id: msg.data.id, dircontents: FS.readdir('.'), lastHttpStatus: lastHttpRequest.status });
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
    const args = msg.data.args || [];
    try {
      callAndCaptureOutput([msg.data.command, ...args]);
      if (msg.data.id) {
        postMessage({ id: msg.data.id, result: stdout });
      }
    } catch (e) {
      if (msg.data.id) {
        postMessage({ id: msg.data.id, error: stderr });
      }
    }
  }
};