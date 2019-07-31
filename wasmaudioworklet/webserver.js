const http = require('http');
const path = require('path');
const fs = require('fs');


http.createServer( (request, response) => {
    
    let path = request.url.substring(1).split('?')[0];
  
    if(path === '') {
        path = 'index.html';
    }
    
    if(fs.existsSync(path)) {
        if(path.indexOf('.js') === path.length - 3) {
            console.log(path);
            response.setHeader('Content-Type', 'application/javascript');
        }
        response.end(fs.readFileSync(path));
    } else {
        response.statusCode = 404;
        response.end('');
    }  
}).listen(5000);