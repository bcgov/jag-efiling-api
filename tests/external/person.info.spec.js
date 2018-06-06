var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var get = require('request');

describe('Person info endpoint', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;
    var database;

    beforeEach(function(done) {
        server = new Server();
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

    it('is a rest service', (done)=> {
        execute('insert into person(login) values($1);', ['max'], function() {
            get(home + '/api/persons/max', function(err, response, body) {
                expect(response.statusCode).to.equal(200);
                expect(JSON.parse(body).login).to.equal('max');
                done();
            });
        });
    });

    it('resists unknown user', (done)=> {
        get(home + '/api/persons/max', function(err, response, body) {
            expect(response.statusCode).to.equal(404);
            expect(JSON.parse(body)).to.deep.equal({message:'not found'});
            done();
        });
    });
});
