var expect = require('chai').expect;
var Server = require('../../app/server/server');
var alwaysValid = require('../support/token.always.valid.js');
var Database = require('../../app/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { localhost } = require('../support/postgres.client.factory');

describe('Form 2 save', function() {

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
        var socket = require('socket.io-client')(home, { forceNew: true });
        socket.on('connect', function() {
            socket.emit('form-2-save', { token:'any', data:{
                    formSevenNumber:'ABC', 
                    respondent:{
                        name:'Bruce', 
                        address:'near'
                    }
                } }, function(data) {
                expect(data.status).to.equal(201);  
                expect(data.id).not.to.equal(undefined);     
                var client = localhost();
                client.connect(function(err) {                
                    expect(err).to.equal(null);
                    var sql = 'SELECT id, type, status, data FROM forms where id=$1';
                    client.query(sql, [data.id], function(err, result) {
                        expect(err).to.equal(null);
                        expect(result.rows.length).to.equal(1);
                        var { type, status, data } = result.rows[0];

                        expect(type).to.equal('form-2');
                        expect(status).to.equal('draft');
                        expect(data).to.equal(JSON.stringify({
                            formSevenNumber:'ABC', 
                            respondent:{
                                name:'Bruce', 
                                address:'near'
                            }
                        }));
                        client.end();
                        done();
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
        var socket = require('socket.io-client')(home, { forceNew: true });
        socket.on('connect', function() {
            socket.emit('form-2-save', { token:'any', data:{
                    formSevenNumber:'ABC', 
                    respondent:{
                        name:'Bruce', 
                        address:'near'
                    }
                } }, function(data) {
                expect(data).to.equal(null);  
                var client = localhost();
                client.connect(function(err) {                
                    expect(err).to.equal(null);
                    var sql = 'SELECT id, type, status, data FROM forms';
                    client.query(sql, function(err, result) {
                        expect(err).to.equal(null);
                        
                        expect(result.rows.length).to.equal(0);
                        client.end();
                        done();
                    });
                });
            });
        });
    });
});
