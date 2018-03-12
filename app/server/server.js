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
        response.setHeader('Content-Type', 'application/json');
        var parsed = url.parse(request.url, true);
        if ('/form-7' == parsed.pathname) {
            self.tokenValidator.validate(parsed.query.token, function(isValid) {
                if (!isValid) {
                    response.statusCode = 403;
                    response.end();
                } else {
                    self.service.searchForm7(parsed.query.file, function(data) {
                        var body = { parties: data };
                        response.write( JSON.stringify(body) );
                        response.end();                   
                    });
                }
            });
        }
        else {
            var body = { message: self.message };
            response.write( JSON.stringify(body) );
            response.end();               
        }
    });
    this.http.listen(port, ip, done);
};

Server.prototype.stop = function (done) {
    if (this.http) {
        this.http.close();
    }
    done();
};

Server.prototype.useService = function(service) {
    this.service = service;
}

Server.prototype.useTokenValidator = function(tokenValidator) {
    this.tokenValidator = tokenValidator;
}

module.exports = Server;
