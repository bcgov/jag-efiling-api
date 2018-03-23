var expect = require('chai').expect;
var Server = require('../../app/server/server');
var alwaysValid = require('../support/token.always.valid.js');
var Database = require('../../app/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { localhost } = require('../support/postgres.client.factory');

describe('My cases endpoint', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;
    var database;

    beforeEach(function(done) {
        server = new Server();
        server.useTokenValidator(alwaysValid);
        database = new Database(localhost);
        server.useDatabase(database);
        var migrator = new Migrator(localhost);
        migrator.migrateNow(function() {
            var truncator = new Truncator(localhost);
            truncator.truncateTablesNow(function() {
                server.start(port, ip, done);
            });
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });    

    it('is a socket service', function(done) {
        var client = localhost();
        client.connect(function(err) {                
            expect(err).to.equal(null);
            var sql = 'insert into forms(type, status, data) values($1, $2, $3);';
            client.query(sql, ['crazy', 'new', JSON.stringify({value:42})], function(err, result) {
                expect(err).to.equal(null);
                client.query('select last_value from forms_id_seq', function(err, result) {
                    expect(err).to.equal(null);
                    expect(result.rows.length).to.equal(1);
                    var newId = parseInt(result.rows[0].last_value);
                    var socket = require('socket.io-client')(home, { forceNew: true });
                    socket.on('connect', function() {
                        socket.emit('my-cases', { token:'any', data:{} }, function(data) {
                            expect(data).to.deep.equal({
                                cases: [
                                    { id:newId, type:'crazy', status:'new', data:{value:42} }
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
        var client = localhost();
        client.connect(function(err) {                
            expect(err).to.equal(null);
            var sql = 'insert into forms(type, status, data) values($1, $2, $3);';
            client.query(sql, ['crazy', 'new', JSON.stringify({value:42})], function(err, result) {
                expect(err).to.equal(null);
                client.query('select last_value from forms_id_seq', function(err, result) {
                    expect(err).to.equal(null);
                    expect(result.rows.length).to.equal(1);
                    var newId = parseInt(result.rows[0].last_value);
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
});
