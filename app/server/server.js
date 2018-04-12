var RestAdaptor = require('./rest.adaptor');
const express = require('express');

function Server() {    
    this.restAdaptor = new RestAdaptor();
    this.app = express();
};

Server.prototype.start = function (port, ip, done) {
    this.restAdaptor.route(this.app);
    this.server = this.app.listen(port, ip, done);
};

Server.prototype.stop = function (done) {
    this.server.close();
    done();
};

Server.prototype.useService = function(hub) {
    this.restAdaptor.useHub(hub);
};

Server.prototype.useTokenValidator = function(tokenValidator) {
    this.restAdaptor.useTokenValidator(tokenValidator);
};

Server.prototype.useDatabase = function(database) {
    this.restAdaptor.useDatabase(database);
};


module.exports = Server;
