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
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Content-Type', 'application/json');
        response.write( JSON.stringify({ message: self.message }) );
        response.end();               
    });    
    self.io = require('socket.io')(this.http);
    self.io.on('connection', function(socket) {
        socket.on('form-7-search', function(data, callback) {
            self.tokenValidator.validate(data.token, function(isValid) {
                if (!isValid) {
                    callback(undefined);
                } else {
                    self.service.searchForm7(data.file, function(data) {
                        callback({ parties: data });
                    });
                }
            });
        });
        socket.on('form-2-save', function(params, callback) {
            self.tokenValidator.validate(params.token, function(isValid) {
                if (!isValid) {
                    callback(undefined);
                } else {
                    self.database.saveForm({ type:'form-2', data:params.data }, function(id) {
                        callback({ status:201, id:id });
                    });
                }
            });
        });
    });
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
    this.service = service;
};

Server.prototype.useTokenValidator = function(tokenValidator) {
    this.tokenValidator = tokenValidator;
};

Server.prototype.useDatabase = function(database) {
    this.database = database;
};


module.exports = Server;
