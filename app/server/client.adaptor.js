let fs = require('fs')
let path = require('path')
let express = require('express')
let ClientAdaptor = function() {};

ClientAdaptor.prototype.route = function(app) {
    app.use('/client/images', express.static(__dirname + '/../client/images'));
    app.get('/client/all.js', (request, response)=> {
        response.writeHead(200, { 'content-type':'application/javascript' })
        let js = ''
        let files = fs.readdirSync(path.join(__dirname, '..', 'client', 'js', 'yaf'))
        for (var i=0; i<files.length; i++) {
            js += fs.readFileSync(path.join(__dirname, '..', 'client', 'js', 'yaf', files[i]))
        }
        files = fs.readdirSync(path.join(__dirname, '..', 'client', 'js'))
                    .filter((file)=> file.endsWith('.js'))
        for (var i=0; i<files.length; i++) {
            js += fs.readFileSync(path.join(__dirname, '..', 'client', 'js', files[i]))
        }
        response.end(js)
    });
    app.get('/client/all.css', (request, response)=> {
        response.writeHead(200, { 'content-type':'text/css' })
        response.end(require('fs').readFileSync(path.join(__dirname, '..', 'client', 'css', 'all.css')).toString())
    });
    app.get('/client', (request, response)=> {
        let html = fs.readFileSync(path.join(__dirname, '..', 'client', 'index.html')).toString()
        response.writeHead(200, {'Content-type': 'text/html'});
        response.end(html);
    });

};


module.exports = ClientAdaptor;
