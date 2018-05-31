var expect = require('chai').expect;
var http = require ('http');
var Hub = require('../../app/hub/hub');

describe('Hub unavailable', function() {

    var server;
    var brokenhub;
    var port = 8111;
    var broken = 'http://bob' + ":" + port;
    var received;

    beforeEach((done)=> {
        brokenhub = new Hub(broken);
        server = http.createServer((request, response)=>{
            console.log("request url, response: ", request.url, response);
            received = request.url;
            response.setHeader('content-type', 'application/json');
            response.write(body);
            response.end();
        }).listen(port, done);
    });

    afterEach(function(done) {
        server.close(done);
    });

    it('handles internet outages gracefully', function(done) {
        brokenhub.searchForm7('this-id', (data)=> {
            expect(data).to.equal('503:SERVICE UNAVAILABLE');
            done();
        });
    });
});