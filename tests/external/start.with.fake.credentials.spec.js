var expect = require('chai').expect;
var { execute } = require('yop-postgresql');
var { request } = require('../support/request');

describe('start script with fake credentials', function() {

    var server;

    before(function(done) {
        server = require('../../start.with.fake.credentials');
        setTimeout(function() {
            done();
        }, 1500);
    });
    after(function(done) {
        server.stop(done);
    });

    it('starts http ping server', function(done) {
        var ping = {
            host: server.ip,
            port: server.port,
            path: '/ping',
        };
        request(ping, (err, response, body)=> {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal(JSON.stringify({ message:'pong' }));
            done();
        });
    });
});
