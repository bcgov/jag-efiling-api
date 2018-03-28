var expect = require('chai').expect;
var get = require('request');
var { execute } = require('yop-postgresql');

describe('start script', function() {

    var server;

    before(function(done) {
        process.env.PGHOST = 'localhost';
        process.env.PGDATABASE = 'e-filing';
        server = require('../../start');
        setTimeout(function() {
            done();
        }, 300);
    });
    after(function(done) {
        server.stop(done);
    });

    it('migrates database', function(done) {
        execute('select id from versions', [], function(rows) {
            expect(rows.length).to.equal(1);
            expect(rows[0].id).to.equal(3);
            done();
        });      
    });

    it('starts http ping server', function(done) {
        var ping = 'http://' + server.ip + ':' + server.port + '/ping';
        get(ping, function(err, response, body) {
            expect(err).to.equal(null);
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal(JSON.stringify({ message:'pong' }));
            done();
        });
    });
});