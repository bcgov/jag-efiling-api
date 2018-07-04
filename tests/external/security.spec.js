var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var request = require('request');

describe('Authentication', function() {

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

    it('is needed', function(done) {
        var options = {
            url: home + '/ping',
            headers: {
                'SMGOV_USERGUID': 'max'
            }
        };
        request.get(options, function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(body).to.deep.equal(JSON.stringify({ message:'pong' }));
            done();
        });       
    });
    it('returns 401 otherwise', function(done) {
        var options = {
            url: home + '/ping',
            headers: {
                'MISSING': 'max'
            }
        };
        request.get(options, function(err, response, body) {
            expect(response.statusCode).to.equal(401);
            expect(body).to.deep.equal(JSON.stringify({ message:'unauthorized' }));
            done();
        });       
    });
});
