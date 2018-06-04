var expect = require('chai').expect;
var http = require('http');
var Hub = require('../../../app/hub/hub');

describe('Hub search-form-7', ()=> {

    var hub;
    var server;
    var port = 8111;
    var ip = 'localhost';
    var far = 'http://' + ip + ':' + port;

    beforeEach((done)=> {
        hub = new Hub(far);
        server = http.createServer((request, response)=>{
            setTimeout(() => {
                response.write("not important");
                response.end();
            }, 5000);
        }).listen(port, done);
    });

    afterEach(function(done) {
        if (server.listening) {
            server.close(done);
        }
        else {
            done();
        }
    });

    it('resists connection socket timeout', (done)=>{
        hub.searchForm7('any', (data)=> {
            expect(data).to.equal('503:SERVICE UNAVAILABLE');
            done();
        });
    });

});

