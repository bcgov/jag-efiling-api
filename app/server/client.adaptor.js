let fs = require('fs')
let path = require('path')
let express = require('express')
let ClientAdaptor = function() {};

var folder = function(...name) {
    let content = ''
    let fullName = path.join.apply(null, name)
    let files = fs.readdirSync(fullName)
    for (var i=0; i<files.length; i++) {
        if (files[i].endsWith('.js')) {
            var file = path.join.apply(null, name.concat(files[i]))
            content += fs.readFileSync(file)
        }
    }
    return content
}

ClientAdaptor.prototype.route = function(app) {
    app.use('/client/css', express.static(path.join(__dirname, '..', 'client', 'css')));
    app.use('/client/images', express.static(path.join(__dirname, '..', 'client', 'images')));
    app.use('/client/fonts', express.static(path.join(__dirname, '..', 'client', 'fonts')));
    app.get('/client/all.js', (request, response)=> {
        response.writeHead(200, { 'content-type':'application/javascript' })
        let js = ''
        js += folder(__dirname, '..', 'client', 'js', 'yop')
        js += folder(__dirname, '..', 'client', 'js')
        js += folder(__dirname, '..', 'client', 'js', 'pages', 'components')
        js += folder(__dirname, '..', 'client', 'js', 'pages')
        response.end(js)
    });
    app.get('/client*', (request, response)=> {
        let html = fs.readFileSync(path.join(__dirname, '..', 'client', 'index.html')).toString()
        response.writeHead(200, {'Content-type': 'text/html'});
        response.end(html);
    });

};


module.exports = ClientAdaptor;
