
var orighash = 0xEACA71C2; 
var hash = orighash;
var str = "GetStdHandle";

for(var n=0;n<str.length;n++) {
   console.log(str.charCodeAt(n).toString(16), hash.toString(16) );
   hash = (str.charCodeAt(n) ^ hash >>> 0) >>> 0;
   hash = ((hash << 7 >>>0 ) | (hash >> 25 & 0x7f)) >>> 0 ;
  
}

console.log(hash.toString(16));

hash = 0;
for(var n=str.length-1;n>=0;n--) {
    
    hash = ((hash >> 7 & 0x1ffffff ) | (hash << 25)) >>> 0;
    
    hash = (str.charCodeAt(n) ^ hash >>> 0) >>> 0;
    
    console.log(str.charCodeAt(n).toString(16), hash.toString(16) );
    
}

console.log(hash.toString(16), orighash.toString(16));