var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var home = 'http://' + ip + ':' + port;
var Server = require('./app/server/server');
var server = new Server();

server.useTokenValidator(require('./tests/support/token.always.valid.js'));
server.useService(require('./tests/support/in.memory.service.js'));


var pg = require('pg');
var client = new pg.Client();
client.connect(function(err) {
    console.log('postgresql connection status: ' + JSON.stringify(err));
    if (!err) {
        var sql = 'select content from messages';
        client.query(sql, function(err, result) {
            client.end();
            console.log('RESULT: ' + JSON.stringify(result));
            server.setMessage(result.rows[0].content);
        });
    }
});

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

var request = require('request');
var ssg = 'https://wsgw.dev.jag.gov.bc.ca/dev/TestService';
console.log('trying to connect to ' + ssg);
request(ssg, function(err, response, body) {
    console.log('received:');
    console.log(err);
    if (response) {console.log(response.statusCode);}
    console.log(body);
    console.log('***');
});

module.exports = server;
module.exports.port = port;
