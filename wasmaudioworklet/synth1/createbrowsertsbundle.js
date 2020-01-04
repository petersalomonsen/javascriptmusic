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
fileList.forEach(filename => {
  fileMap[filename.substr(rootdir.length)] = fs.readFileSync(filename).toString();
});
fs.writeFileSync('wasmsynthassemblyscriptsources.json', JSON.stringify(fileMap));