let RestAdaptor = require('./rest.adaptor');
let express = require('express');
let bodyParser = require("body-parser");
let morgan = require('morgan');

function Server() {    
    this.restAdaptor = new RestAdaptor();
    this.app = express();
};

Server.prototype.start = function (port, ip, done) {
    this.app.use((request, response, next)=>{
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Headers', 'x-user');
        response.setHeader('Content-Type', 'application/json');
        next();
    });
    this.app.use(morgan(':method :url :req[x-user]', { immediate:true }))
    this.app.use(bodyParser.urlencoded({ extended: false }));    
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
