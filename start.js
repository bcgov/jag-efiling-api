var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var ip = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var home = 'http://' + ip + ':' + port;

var FakeBceIDServer = require('./app/server/fake.bceid.server');
var fakeBceIDServer = new FakeBceIDServer({token:'monday'});

var Server = require('./app/server/server');
var server = new Server();
server.useBceidServer(fakeBceIDServer);

server.start(port, ip, function() {
    console.log(ip + ' listening on port ' + port);
});

console.log('POSTGRESQL config:');
console.log('database=' + process.env.POSTGRESQL_DATABASE);

module.exports = server;
module.exports.port = port;
