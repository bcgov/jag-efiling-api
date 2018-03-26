var expect = require('chai').expect;

describe('start script', function() {

    var server;

    before(function(done) {
        process.env.PGHOST = 'localhost';
        process.env.PGDATABASE = 'e-filing';
        server = require('../../start');
        setTimeout(function() {
            done();
        }, 200);
    });
    after(function(done) {
        server.stop(done);
    });

    it('migrates database', function(done) {
        var { execute } = require('../../app/store/postgresql');
        execute.connection = server.connection;
        execute('select id from versions', [], function(rows) {
            expect(rows.length).to.equal(1);
            expect(rows[0].id).to.equal(2);
            done();
        });      
    });

    it('starts http ping server', function(done) {
        var get = require('request');
        var ping = 'http://' + server.ip + ':' + server.port + '/ping';
        get(ping, function(err, response, body) {
            expect(err).to.equal(null);
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal(JSON.stringify({ message:'pong' }));
            done();
        });
    });
});