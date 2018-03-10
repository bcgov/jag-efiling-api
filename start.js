var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var home = 'http://' + ip + ':' + port;
var Server = require('./app/server/server');
var server = new Server();

server.start(port, ip, function() {
    console.log(ip + ' listening on port ' + port);
});

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

module.exports = server;
module.exports.port = port;
