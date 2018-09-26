var expect = require('chai').expect;
var get = require('request');
var { execute } = require('yop-postgresql');

describe('start script with fake credentials', function() {

    var server;

    before(function(done) {
        server = require('../../start.with.fake.credentials');
        setTimeout(function() {
            done();
        }, 300);
    });
    after(function(done) {
        server.stop(done);
    });

    it('starts http ping server', function(done) {        
        var ping = {
            url: 'http://' + server.ip + ':' + server.port + '/ping',            
        };
        get(ping, function(err, response, body) {
            expect(err).to.equal(null);
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal(JSON.stringify({ message:'pong' }));
            done();
        });
    });
});