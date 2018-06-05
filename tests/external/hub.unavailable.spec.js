var expect = require('chai').expect;
var Hub = require('../../app/hub/hub');
var Server = require('../../app/server/server');
var get = require('request');

describe('Hub unavailable', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;

    var hub;

    beforeEach(function(done) {        
        hub = require('http').createServer((req, res)=>{
            res.statusCode = 503;
            res.end();
        }).listen(5001, ()=>{
            server = new Server();        
            server.start(port, ip, done);        
        });
    });

    afterEach(function(done) {
        server.stop(()=>{
            hub.close(done);
        });
    });  

    it('propagates unable to connect as 503', function(done) {
        server.useService(new Hub('http://not-running'));
        get(home + '/api/forms?file=CA42', function(err, response, body) {   
            expect(response.statusCode).to.equal(503);
            expect(JSON.parse(body)).to.deep.deep.equal({message:'service unavailable'});
            done();
        });
    });

    it('propagates 503', function(done) {
        server.useService(new Hub('http://localhost:5001'));
        get(home + '/api/forms?file=CA42', function(err, response, body) {   
            expect(response.statusCode).to.equal(503);
            expect(JSON.parse(body)).to.deep.deep.equal({message:'service unavailable'});
            done();
        });
    });
});