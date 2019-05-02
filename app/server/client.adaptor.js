let fs = require('fs')
let path = require('path')
let express = require('express')
let ClientAdaptor = function() {};

ClientAdaptor.prototype.route = function(app) {
    app.use('/client/css', express.static(path.join(__dirname, '..', 'client', 'css')));
    app.use('/client/images', express.static(path.join(__dirname, '..', 'client', 'images')));
    app.use('/client/fonts', express.static(path.join(__dirname, '..', 'client', 'fonts')));
    app.get('/client/all.js', (request, response)=> {
        response.writeHead(200, { 'content-type':'application/javascript' })
        let js = ''
        let files = fs.readdirSync(path.join(__dirname, '..', 'client', 'js', 'yop'))
        for (var i=0; i<files.length; i++) {
            js += fs.readFileSync(path.join(__dirname, '..', 'client', 'js', 'yop', files[i]))
        }
        files = fs.readdirSync(path.join(__dirname, '..', 'client', 'js'))
                    .filter((file)=> file.endsWith('.js'))
        for (var i=0; i<files.length; i++) {
            js += fs.readFileSync(path.join(__dirname, '..', 'client', 'js', files[i]))
        }
        response.end(js)
    });
    app.get('/client*', (request, response)=> {
        let html = fs.readFileSync(path.join(__dirname, '..', 'client', 'index.html')).toString()
        response.writeHead(200, {'Content-type': 'text/html'});
        response.end(html);
    });

};


module.exports = ClientAdaptor;
