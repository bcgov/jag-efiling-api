var { expect } = require('chai')
var { request, localhost5000json } = require('../support/request');
var Server = require('../../app/server/server');

describe('Ping', function() {

    var server;
    var ping = localhost5000json({
        path: '/ping',
    })

    beforeEach(function(done) {
        server = new Server();
        server.start(5000, 'localhost', done);
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('works', function(done) {
        request(ping, (err, response, body)=> {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('returns pong', function(done) {
        request(ping, (err, response, body)=> {
            expect(response.statusCode).to.equal(200);
            expect(body).to.deep.equal(JSON.stringify({ message:'pong' }))
            done();
        });
    });

    it('is default answer', function(done) {
        ping.path = '/anything-unknown'
        request(ping, (err, response, body)=> {
            expect(response.statusCode).to.equal(200);
            expect(body).to.deep.equal(JSON.stringify({ message:'pong' }))
            done();
        });
    });
});
