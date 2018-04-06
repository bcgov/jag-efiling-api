var SocketAdaptor = require('./socket.adaptor');
var RestAdaptor = require('./rest.adaptor');

function Server() {    
    this.socketAdaptor = new SocketAdaptor();
    this.restAdaptor = new RestAdaptor();
};

Server.prototype.start = function (port, ip, done) {
    this.http = require('http').createServer((request, response) => {
        console.log(request.url);
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Content-Type', 'application/json');
        this.restAdaptor.connect(request, response);                              
    });    
    this.io = require('socket.io')(this.http);
    this.io.on('connection', (socket) => { this.socketAdaptor.connect(socket); });
    this.http.listen(port, ip, done);
};

Server.prototype.stop = function (done) {
    if (this.http) {
        this.http.close();
    }
    if (this.io) { 
        this.io.close();
    }
    done();
};

Server.prototype.useService = function(hub) {
    this.socketAdaptor.useService(hub);
    this.restAdaptor.useHub(hub);
};

Server.prototype.useTokenValidator = function(tokenValidator) {
    this.socketAdaptor.useTokenValidator(tokenValidator);
    this.restAdaptor.useTokenValidator(tokenValidator);
};

Server.prototype.useDatabase = function(database) {
    this.socketAdaptor.useDatabase(database);
    this.restAdaptor.useDatabase(database);
};


module.exports = Server;
