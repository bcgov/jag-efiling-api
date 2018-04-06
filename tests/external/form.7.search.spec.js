var expect = require('chai').expect;
var Server = require('../../app/server/server');
var alwaysValid = require('../support/token.always.valid.js');
var get = require('request');

describe('Form 7 search', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;

    beforeEach(function(done) {
        server = new Server();
        server.start(port, ip, done);
        server.useTokenValidator(alwaysValid);
        server.useService({
            searchForm7: function(fileNumber, callback) {
                callback([fileNumber]);
            }
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });    

    it('is a socket service', function(done) {
        var socket = require('socket.io-client')(home, { forceNew: true });
        socket.on('connect', function() {
            socket.emit('form-7-search', { token:'any', file:42 }, function(data) {
                expect(data).to.deep.equal({ parties: [42] });     
                done();
            });
        });
    });

    it('requires a valid token', function(done) {
        server.useTokenValidator({
            validate: function(token, callback) {
                callback(false);
            }
        });
        var socket = require('socket.io-client')(home, { forceNew: true });
        socket.on('connect', function() {
            socket.emit('form-7-search', { token:'any', file:42 }, function(data) {
                expect(data).to.deep.equal(null);     
                done();
            });
        });
    });

    it('is a rest service', function(done) {
        get(home + '/api/forms?file=42&token=any', function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.equal({ parties: [42] });
            done();
        });
    });

    it('is a rest service that requires a valid token', function(done) {
        server.useTokenValidator({
            validate: function(token, callback) {
                callback(false);
            }
        });
        get(home + '/api/forms?file=42&token=any', function(err, response, body) {
            expect(response.statusCode).to.equal(403);
            expect(body).to.deep.equal('');
            done();
        });
    });
});
