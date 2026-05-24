let stdout;
let stderr;
let captureOutput = false;
let currentRepoDir;
const CONFIG_FILE = 'wasmmusic.config.json';
const WASM_GIT_BASE_URL = '/wasm-git/';
const OPFS_MOUNT = '/opfs';

globalThis.wasmGitModuleOverrides = {
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

let lg;
let FS;

const lgPromise = (async () => {
  const lg2mod = await import(WASM_GIT_BASE_URL + 'lg2_opfs.js');
  lg = await lg2mod.default();
  FS = lg.FS;

  // WASMFS doesn't pre-create /home/web_user
  try { FS.mkdir('/home'); } catch (e) { }
  try { FS.mkdir('/home/web_user'); } catch (e) { }

  // Create OPFS backend and mount point
  const backend = lg._lg2_create_opfs_backend();
  try {
    lg.ccall('lg2_create_directory', 'number',
      ['string', 'number', 'number'],
      [OPFS_MOUNT, 0o777, backend]);
  } catch (e) { }

  return lg;
})();

function ensureChdir(dir) {
  FS.chdir(dir);
}

function callMainInDir(args) {
  if (currentRepoDir) {
    ensureChdir(currentRepoDir);
  }
  lg.callMain(args);
}

onmessage = async (msg) => {
  await lgPromise;

  function callAndCaptureOutput(args) {
    captureOutput = true;
    stderr = '';
    stdout = '';
    callMainInDir(args);
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

  function readdir() {
    ensureChdir(currentRepoDir);
    return FS.readdir('.');
  }

  if (msg.data.accessToken) {
    accessToken = msg.data.accessToken;
    username = msg.data.username;
    useremail = msg.data.useremail;
    postMessage({ accessTokenConfigured: true });
  } else if (msg.data.command === 'writefileandstage') {
    ensureChdir(currentRepoDir);
    // Create parent dirs if any (e.g. faust/foo.dsp needs faust/ first).
    const segments = msg.data.filename.split('/');
    let dirAcc = '';
    for (let i = 0; i < segments.length - 1; i++) {
      dirAcc += (i === 0 ? '' : '/') + segments[i];
      try { FS.mkdir(dirAcc); } catch (_) { /* exists */ }
    }
    const data = msg.data.binary
      ? (msg.data.contents instanceof Uint8Array ? msg.data.contents : new Uint8Array(msg.data.contents))
      : new TextEncoder().encode(msg.data.contents);
    // Skip identical re-writes so we don't touch mode/mtime — otherwise the
    // bridge bouncing a same-content file back into OPFS would surface as a
    // bogus "modified" entry in git status.
    let identical = false;
    try {
      const existing = FS.readFile(msg.data.filename);
      if (existing.length === data.length) {
        identical = true;
        for (let i = 0; i < data.length; i++) {
          if (existing[i] !== data[i]) { identical = false; break; }
        }
      }
    } catch (_) { /* new file */ }
    if (!identical) {
      // WASMFS+OPFS does not truncate on writeFile — open with O_TRUNC, write, close
      const fd = FS.open(msg.data.filename, 577); // O_WRONLY | O_CREAT | O_TRUNC
      FS.write(fd, data, 0, data.length, 0);
      FS.close(fd);
      // `git add` is a no-op for paths matched by .gitignore — that's how we
      // keep bridge-synced binaries (images, samples) out of the actual git
      // history.
      callMainInDir(['add', '--verbose', msg.data.filename]);
      console.log(currentRepoDir, 'persisted via OPFS');
    }
    postMessage({ dircontents: readdir(), repoHasChanges: repoHasChanges() });
  } else if (msg.data.command === 'dir') {
    postMessage({ id: msg.data.id, dircontents: readdir() });
  } else if (msg.data.command === 'repohaschanges') {
    postMessage({ repohaschanges: repoHasChanges() });
  } else if (msg.data.command === 'commitpullpush') {
    if (repoHasChanges()) {
      callMainInDir(['config', 'user.name', username]);
      callMainInDir(['config', 'user.email', useremail]);

      callMainInDir(['commit', '-m', msg.data.commitmessage]);
    }

    let err = null;
    lastHttpRequest = null;
    try {
      callAndCaptureOutput(['fetch', 'origin']);
      if (stdout.indexOf('Received 0/0 objects') === -1) {
        callAndCaptureOutput(['merge', 'FETCH_HEAD']);
      }
      callAndCaptureOutput(['push']);
    } catch (e) {
      err = e.message;
      if (lastHttpRequest) {
        err += ` http status: ${lastHttpRequest.status}`;
      }
    }
    console.log(currentRepoDir, 'persisted via OPFS');
    postMessage({ id: msg.data.id, error: err ? err : undefined, dircontents: readdir() });
  } else if (msg.data.command === 'synclocal') {
    const repoName = msg.data.url.substring(msg.data.url.lastIndexOf('/') + 1);
    currentRepoDir = OPFS_MOUNT + '/' + repoName;
    console.log('synclocal', currentRepoDir);

    try {
      const entries = FS.readdir(currentRepoDir);
      if (entries.find(file => file === '.git')) {
        // Create symlink workaround for WASMFS getcwd() bug
        try { FS.symlink(currentRepoDir, '/' + repoName); } catch (e) { }
        ensureChdir(currentRepoDir);
        postMessage({ dircontents: readdir() });
        console.log(currentRepoDir, 'restored from OPFS');
      } else {
        console.log('no git repo in', currentRepoDir);
        postMessage({ dircontents: null });
      }
    } catch (e) {
      console.log('no directory', currentRepoDir);
      postMessage({ dircontents: null });
    }
  } else if (msg.data.command === 'deletelocal') {
    // Recursively remove the repo directory from WASMFS
    function rmdirRecursive(path) {
      const entries = FS.readdir(path);
      for (const entry of entries) {
        if (entry === '.' || entry === '..') continue;
        const fullPath = path + '/' + entry;
        const stat = FS.stat(fullPath);
        if (FS.isDir(stat.mode)) {
          rmdirRecursive(fullPath);
        } else {
          FS.unlink(fullPath);
        }
      }
      FS.rmdir(path);
    }
    const repoName = currentRepoDir.substring(currentRepoDir.lastIndexOf('/') + 1);
    try {
      FS.chdir(OPFS_MOUNT);
      rmdirRecursive(currentRepoDir);
    } catch (e) {
      console.error('Error deleting from WASMFS', currentRepoDir, e);
    }
    // Also clear the underlying OPFS storage
    try {
      const opfsRoot = await navigator.storage.getDirectory();
      await opfsRoot.removeEntry(repoName, { recursive: true });
      console.log('Deleted OPFS entry', repoName);
    } catch (e) {
      console.error('Error deleting from OPFS', repoName, e);
    }
    try { FS.unlink('/' + repoName); } catch (e) { }
    currentRepoDir = undefined;
    postMessage({ id: msg.data.id, deleted: repoName });
  } else if (msg.data.command === 'clone') {
    const repoName = msg.data.url.substring(msg.data.url.lastIndexOf('/') + 1);
    currentRepoDir = OPFS_MOUNT + '/' + repoName;

    callMainInDir(['clone', msg.data.url, currentRepoDir]);

    // Create symlink workaround for WASMFS getcwd() bug
    try { FS.symlink(currentRepoDir, '/' + repoName); } catch (e) { }
    ensureChdir(currentRepoDir);

    console.log(currentRepoDir, 'persisted via OPFS');
    postMessage({ dircontents: readdir() });
  } else if (msg.data.command === 'diff') {
    try {
      callAndCaptureOutput(['status']);
      if (stdout.indexOf('On branch Not currently on any branch') === -1) {
        callAndCaptureOutput(['diff', 'HEAD']);
      }
    } catch (e) {

    }
    postMessage({ diff: stdout });
  } else if (msg.data.command === 'pull') {
    callMainInDir(['fetch', 'origin']);
    callMainInDir(['merge', 'FETCH_HEAD']);
    console.log(currentRepoDir, 'persisted via OPFS');
    postMessage({ id: msg.data.id, dircontents: readdir(), lastHttpStatus: lastHttpRequest.status });
  } else if (msg.data.command === 'listfiles') {
    // List files matching an optional prefix (e.g. "faust/"). Returns an
    // array of paths (strings) relative to the repo root. Walks the working
    // tree directly via FS so both committed and just-staged files appear.
    try {
      ensureChdir(currentRepoDir);
      const prefix = msg.data.prefix || '';
      // Standard Unix mode bitmask — Emscripten's FS exposes `mode` from
      // FS.stat() but FS.isDir() isn't always available on the helper.
      const S_IFMT = 0o170000;
      const S_IFDIR = 0o040000;
      const result = [];
      function walk(virtBase, relBase) {
        let entries;
        try { entries = FS.readdir(virtBase); } catch (e) { return; }
        for (const entry of entries) {
          if (entry === '.' || entry === '..' || entry === '.git') continue;
          const childVirt = virtBase === '.' ? entry : virtBase + '/' + entry;
          const childRel = relBase ? relBase + '/' + entry : entry;
          let stat;
          try { stat = FS.stat(childVirt); } catch (e) { continue; }
          if ((stat.mode & S_IFMT) === S_IFDIR) {
            walk(childVirt, childRel);
          } else {
            if (!prefix || childRel.indexOf(prefix) === 0) {
              result.push(childRel);
            }
          }
        }
      }
      walk('.', '');
      postMessage({ id: msg.data.id, files: result });
    } catch (e) {
      postMessage({ id: msg.data.id, error: e && e.message ? e.message : String(e) });
    }
  } else if (msg.data.command === 'readfile') {
    try {
      ensureChdir(currentRepoDir);
      const options = msg.data.binary ? undefined : { encoding: 'utf8' };
      postMessage({
        filename: msg.data.filename,
        filecontents: FS.readFile(msg.data.filename, options)
      });
    } catch (e) {
      // Echo the filename so the client-side readfile listener only rejects
      // the matching call. Without it, concurrent readfile() Promise.all
      // chains would all reject on any single ENOENT.
      postMessage({ filename: msg.data.filename, error: JSON.stringify(e) });
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
