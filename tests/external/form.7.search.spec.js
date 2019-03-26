var expect = require('chai').expect;
var Server = require('../../app/server/server');
var { request, localhost5000json } = require('../support/request');

describe('Form 7 search', function() {

    var server;
    var search = localhost5000json({
        path: '/api/forms?file=CA42'
    })

    beforeEach(function(done) {
        server = new Server();
        server.start(5000, 'localhost', done);
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
        request(search, (err, response, body)=> {
            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.equal({ parties: { fileNumber:'CA42'} });
            done();
        });
    });

    it('propagates 404', function(done) {
        server.useService({
            searchForm7: function(fileNumber, callback) {
                callback({ error: {code:404} });
            }
        });
        request(search, (err, response, body)=> {
            expect(response.statusCode).to.equal(404);
            expect(JSON.parse(body)).to.deep.equal({message:'not found'});
            done();
        });
    });
});
