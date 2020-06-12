/**
 * Create JSON bundle with sources of the webassembly synth to be compiled directly in the browser
 */
const fs = require('fs');

function walkSync(dir, filelist) {
  const files = fs.readdirSync(dir);
  
  filelist = filelist || [];
  files.forEach(function(file) {
      
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = walkSync(dir + file + '/', filelist);
    }
    else {
      filelist.push(dir + file);
    }
  });
  return filelist;
};

const rootdir = './assembly/';
const fileList = walkSync(rootdir);
const fileMap = {};
const globalimports = [];
fileList.forEach(filename => {
  const filecontent = fs.readFileSync(filename).toString();
  const adjustedFileName = filename.substr(rootdir.length);

  switch(adjustedFileName.split('/')[0]) {
    case 'instruments':
    case 'math':
    case 'fx':
    case 'common':
    case 'synth':
      filecontent.split(/\n/)
        .filter(line => line.startsWith('export '))
        .map(line => line.replace(' abstract ', ' ').split(' ')[2])
        .map(name => name.split(/[^A-Za-z_0-9]/)[0])
        .forEach(name => globalimports.push(`export { ${name} } from '../${adjustedFileName.replace(/\.ts$/,'')}';`));
    default:
  }
  fileMap[adjustedFileName] = filecontent;  
});
fileMap['mixes/globalimports.ts'] = globalimports.join('\n');
fs.writeFileSync('assembly/mixes/globalimports.ts', fileMap['mixes/globalimports.ts']);
fs.writeFileSync('wasmsynthassemblyscriptsources.json', JSON.stringify(fileMap));