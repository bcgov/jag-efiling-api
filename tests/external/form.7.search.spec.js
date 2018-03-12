var expect = require('chai').expect;
var request = require('request');
var Server = require('../../app/server/server');

describe('Form 7 search', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;

    beforeEach(function(done) {
        server = new Server();
        server.start(port, ip, done);
        server.useService({
            searchForm7: function(fileNumber, callback) {
                callback([fileNumber]);
            }
        });
        server.useTokenValidator({
            validate: function(token, callback) {
                callback(true);
            }
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });    

    it('return parties', function(done) {
        request(home + '/form-7?token=any&file=42', function(err, response, body) {
            expect(response.statusCode).to.equal(200);       
            expect(JSON.parse(body)).to.deep.equal({ parties: ['42'] });     
            done();
        });
    });

    it('requires a valid token', function(done) {
        server.useTokenValidator({
            validate: function(token, callback) {
                callback(false);
            }
        });
        request(home + '/form-7?token=any&file=42', function(err, response, body) {
            expect(response.statusCode).to.equal(403);         
            done();
        });
    });
});
