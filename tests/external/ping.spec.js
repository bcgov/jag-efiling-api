var expect = require('chai').expect;
var request = require('request');
var Server = require('../../app/server/server');

describe('Ping', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;

    beforeEach(function(done) {
        server = new Server();
        server.start(port, ip, done);
    });

    afterEach(function(done) {
        server.stop(done);
    });    

    it('works', function(done) {
        request(home + '/ping', function(err, response, body) {
            expect(response.statusCode).to.equal(200);            
            done();
        });
    });  

    it('returns pong', function(done) {
        request(home + '/ping', function(err, response, body) {
            expect(JSON.parse(response.body)).to.deep.equal({
                message: 'pong'
            });            
            done();
        });
    });

    it('accepts custom pong message', function(done) {
        server.setMessage('custom');
        request(home + '/ping', function(err, response, body) {
            expect(JSON.parse(response.body)).to.deep.equal({
                message: 'custom'
            });            
            done();
        });
    });
});
