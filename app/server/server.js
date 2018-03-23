var SocketAdaptor = require('./socket.adaptor');

function Server() {    
    this.message = 'pong';
    this.adaptor = new SocketAdaptor();
};

Server.prototype.setMessage = function(value) {
    this.message = value;
};

Server.prototype.start = function (port, ip, done) {
    this.http = require('http').createServer((request, response) => {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Content-Type', 'application/json');
        response.write( JSON.stringify({ message: this.message }) );
        response.end();               
    });    
    this.io = require('socket.io')(this.http);
    this.io.on('connection', (socket) => { this.adaptor.connect(socket); });
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

Server.prototype.useService = function(service) {
    this.adaptor.useService(service);
};

Server.prototype.useTokenValidator = function(tokenValidator) {
    this.adaptor.useTokenValidator(tokenValidator);
};

Server.prototype.useDatabase = function(database) {
    this.adaptor.useDatabase(database);
};


module.exports = Server;
