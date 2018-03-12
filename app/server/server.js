var url = require('url');

function Server() {    
    this.message = 'pong';
};

Server.prototype.setMessage = function(value) {
    this.message = value;
};

Server.prototype.start = function (port, ip, done) {
    var self = this;
    this.http = require('http').createServer(function(request, response) {

        var body = { message: self.message };
        response.setHeader('Content-Type', 'application/json');
        response.write( JSON.stringify(body) );
        response.end();               
    });
    this.http.listen(port, ip, done);
};

Server.prototype.stop = function (done) {
    if (this.http) {
        this.http.close();
    }
    done();
};

module.exports = Server;
