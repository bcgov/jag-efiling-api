var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var home = 'http://' + ip + ':' + port;
var Server = require('./app/server/server');
var server = new Server();
var pg = require('pg');

server.useTokenValidator(require('./tests/support/token.always.valid.js'));
server.useService(require('./tests/support/in.memory.service.js'));

var Database = require('./app/database');
var database = new Database(function() { return new pg.Client(); });
server.useDatabase(database);
var Migrator = require('./app/migrations/migrator');
var migrator = new Migrator(function() { return new pg.Client(); });
migrator.migrateNow(function() {

    server.start(port, ip, function() {
        console.log(ip + ' listening on port ' + port);
    });
});

module.exports = server;
module.exports.port = port;
