var expect = require('chai').expect;
var Hub = require('../../app/hub/hub');
var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var get = require('request');

describe('Database', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;
    var old;

    beforeEach(function(done) {
        old=process.env.PGDATABASE;
        process.env.PGDATABASE='this-database-does-not-exist';
        server = new Server();
        server.useDatabase(new Database());
        server.start(port, ip, done);
    });

    afterEach(function(done) {
        process.env.PGDATABASE=old;
        server.stop(done);
    }); 

    it('propagates unable to connect as 503', function(done) {
        var options = {
            url: home + '/api/cases',
            headers: {
                'X-USER': 'max'
            }
        };
        get(options, (err, response, body)=> {
            expect(response.statusCode).to.equal(503);
            done();
        });
    });
});