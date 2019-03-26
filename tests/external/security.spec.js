var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { request, localhost5000json } = require('../support/request');

describe('Authentication', function() {

    var server;
    var database;

    beforeEach(function(done) {
        server = new Server();
        database = new Database();
        server.useDatabase(database);
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                server.start(5000, 'localhost', done);
            });
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('is needed', function(done) {
        var ping = localhost5000json({
            path: '/ping',
            headers: {
                'SMGOV_USERGUID': 'max'
            }
        })
        request(ping, (err, response, body)=> {
            expect(response.statusCode).to.equal(200);
            expect(body).to.deep.equal(JSON.stringify({ message:'pong' }));
            done();
        });
    });
    it('returns 401 otherwise', function(done) {
        var ping = {
            method: 'GET',
            host: 'localhost',
            port: 5000,
            path: '/ping',
            headers: {
                'MISSING': 'max'
            }
        };
        request(ping, (err, response, body)=> {
            expect(response.statusCode).to.equal(401);
            expect(body).to.deep.equal(JSON.stringify({ message:'unauthorized' }));
            done();
        });
    });
});
