var expect = require('chai').expect;
var Hub = require('../../app/hub/hub');
var Server = require('../../app/server/server');
var get = require('request');

describe('Hub unavailable', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;

    beforeEach(function(done) {
        brokenhub = new Hub('http://bob');

        server = new Server();
        server.start(port, ip, done);
        server.useService(new Hub('http://bob'));
    });

    afterEach(function(done) {
        server.stop(done);
    });  

    it('handles internet outages gracefully', function(done) {
        brokenhub.searchForm7('this-id', (data)=> {
            expect(data).to.equal('503:SERVICE UNAVAILABLE');
            done();
        });        
    });

    it('propagates 503', function(done) {
        get(home + '/api/forms?file=CA42', function(err, response, body) {   
            expect(response.statusCode).to.equal(503);
            expect(JSON.parse(body)).to.deep.deep.equal({message:'service unavailable'});
            done();
        });
    });
});