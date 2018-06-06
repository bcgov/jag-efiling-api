var expect = require('chai').expect;
var Server = require('../../app/server/server');
var get = require('request');

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
                callback({fileNumber:fileNumber});
            }
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });    

    it('is a rest service', function(done) {
        get(home + '/api/forms?file=CA42', function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.equal({ parties: { fileNumber:'CA42'} });
            done();
        });
    });

    it('propagates 404', function(done) {
        server.useService({
            searchForm7: function(fileNumber, callback) {
                callback('404:NOT FOUND');
            }
        });
        get(home + '/api/forms?file=CA42', function(err, response, body) {
            expect(response.statusCode).to.equal(404);
            expect(JSON.parse(body)).to.deep.equal({message:'not found'});
            done();
        });
    });
});
