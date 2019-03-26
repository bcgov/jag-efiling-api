var expect = require('chai').expect;
var Hub = require('../../app/hub/hub');
var Server = require('../../app/server/server');
var { request, localhost5000json } = require('../support/request');

describe('Hub service', function() {

    var server;
    var search = localhost5000json({
        path: '/api/forms?file=CA42'
    })

    var hub;
    var answer;

    beforeEach(function(done) {
        hub = require('http').createServer((req,res)=>{answer(req,res);}).listen(5001, ()=>{
            server = new Server();
            server.start(5000, 'localhost', done);
        });
    });

    afterEach(function(done) {
        server.stop(()=>{
            hub.close(done);
        });
    });

    it('propagates unable to connect as 503', function(done) {
        server.useService(new Hub('http://not-running'));
        request(search, (err, response, body)=> {
            expect(response.statusCode).to.equal(503);
            expect(JSON.parse(body)).to.deep.deep.equal({message:'service unavailable'});
            done();
        });
    });

    it('propagates 503', function(done) {
        answer = (req, res)=>{
            res.statusCode = 503;
            res.end();
        };
        server.useService(new Hub('http://localhost:5001'));
        request(search, (err, response, body)=> {
            expect(response.statusCode).to.equal(503);
            expect(JSON.parse(body)).to.deep.deep.equal({message:'service unavailable'});
            done();
        });
    });

    it('propagates timeout as 503', function(done) {
        let timeout = 50;
        answer = (req, res)=>{
            setTimeout(()=>{
                res.statusCode = 200;
                res.end();
            }, timeout * 10);
        };
        server.useService(new Hub('http://localhost:5001', timeout));
        request(search, (err, response, body)=> {
            expect(response.statusCode).to.equal(503);
            expect(JSON.parse(body)).to.deep.deep.equal({message:'service unavailable'});
            done();
        });
    });
});
