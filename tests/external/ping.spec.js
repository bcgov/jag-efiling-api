var expect = require('chai').expect;
var request = require('request');
var Server = require('../../app/server/server');

describe('Ping', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;
    var options = {
        url: home + '/ping',
        headers:{
            'SMGOV_USERGUID':'max'
        }
    };

    beforeEach(function(done) {
        server = new Server();
        server.start(port, ip, done);
    });

    afterEach(function(done) {
        server.stop(done);
    });    

    it('works', function(done) {
        request(options, function(err, response, body) {
            expect(response.statusCode).to.equal(200);            
            done();
        });
    });  

    it('returns pong', function(done) {
        request(options, function(err, response, body) {
            expect(JSON.parse(response.body)).to.deep.equal({
                message: 'pong'
            });            
            done();
        });
    });

    it('is default answer', function(done) {
        options = {
            url: home + '/anything-unknown',
            headers:{
                'SMGOV_USERGUID':'max'
            }
        };
        request(options, function(err, response, body) {
            expect(response.statusCode).to.equal(200);            
            done();
        });
    }); 
});
