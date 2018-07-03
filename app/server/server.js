let RestAdaptor = require('./rest.adaptor');
let express = require('express');
let bodyParser = require("body-parser");
let morgan = require('morgan');

function Server() {    
    this.restAdaptor = new RestAdaptor();
    this.app = express();
}

Server.prototype.start = function (port, ip, done) {
    this.app.use((request, response, next)=>{
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Headers', 'smgov_userguid,smgov_userdisplayname,Content-Type, Authorization, Content-Length, X-Requested-With');
        response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
        response.setHeader('Content-Type', 'application/json');
        next();
    });
    this.app.use(morgan(':method :url :req[smgov_userguid]', { immediate:true }));
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

Server.prototype.useDatabase = function(database) {
    this.restAdaptor.useDatabase(database);
};


module.exports = Server;
