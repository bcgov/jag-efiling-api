var expect = require('chai').expect;
var Server = require('../../app/server/server');
var alwaysValid = require('../support/token.always.valid.js');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');

describe('My cases endpoint', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;
    var database;

    beforeEach(function(done) {
        server = new Server();
        server.useTokenValidator(alwaysValid);
        database = new Database();
        server.useDatabase(database);
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                server.start(port, ip, done);
            });
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('is a socket service', function(done) {
        execute('select current_timestamp', [], function(rows) {
            var now = rows[0].current_timestamp;
            now = JSON.stringify(now).toString();
            now = now.substring(1, now.lastIndexOf('.'))+'Z';

            execute('insert into forms(type, status, data) values($1, $2, $3);',
                ['crazy', 'new', JSON.stringify({value:42})], function() {
                execute('select last_value from forms_id_seq', [], function(rows) {
                    var newId = parseInt(rows[0].last_value);

                    var socket = require('socket.io-client')(home, { forceNew: true });
                    socket.on('connect', function() {
                        socket.emit('my-cases', { token:'any', data:{} }, function(data) {
                            expect(data).to.deep.equal({
                                cases: [
                                    { id:newId, type:'crazy', modified:now, status:'new', data:{value:42} }
                                ]
                            });
                            done();
                        });
                    });
                });
            });
        });
    });

    it('requires a valid token', function(done) {
        server.useTokenValidator({
            validate: function(token, callback) {
                callback(false);
            }
        });
        execute('insert into forms(type, status, data) values($1, $2, $3);',
                ['crazy', 'new', JSON.stringify({value:42})], function() {
            execute('select last_value from forms_id_seq', [], function(rows) {
                var newId = parseInt(rows[0].last_value);

                var socket = require('socket.io-client')(home, { forceNew: true });
                socket.on('connect', function() {
                    socket.emit('my-cases', { token:'any', data:{} }, function(data) {
                        expect(data).to.deep.equal(null);
                        done();
                    });
                });
            });
        });
    });
});
