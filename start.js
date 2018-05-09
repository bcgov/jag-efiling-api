var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var home = 'http://' + ip + ':' + port;

var Database = require('./app/store/database');
var database = new Database();
var Migrator = require('./app/migrations/migrator');
var migrator = new Migrator();

var Server = require('./app/server/server');
var server = new Server();
server.useService(require('./tests/support/in.memory.service.js'));
if (process.env.HUB_URL !=='undefined' && process.env.HUB_URL !==undefined) {
    console.log('hub is ' + process.env.HUB_URL);
    var Hub = require('./app/hub/hub');
    var hub = new Hub(process.env.HUB_URL);
    server.useService(hub);
}
server.useDatabase(database);

console.log('migrating...');
migrator.migrateNow(function(error) {
    console.log(error);
    console.log('migrations done');
    server.start(port, ip, function() {
        console.log(ip + ' listening on port ' + port);
    });
});

module.exports = server;
module.exports.port = port;
module.exports.ip = ip;
