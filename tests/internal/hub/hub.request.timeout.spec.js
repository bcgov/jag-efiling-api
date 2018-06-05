var expect = require('chai').expect;
var http = require('http');
var Hub = require('../../../app/hub/hub');

describe('Hub search-form-7', ()=> {

    var hub;
    var server;
    var port = 8111;
    var ip = 'localhost';
    var far = 'http://' + ip + ':' + port;
    var timeout = 200;

    beforeEach((done)=> {
        hub = new Hub(far, timeout);
        server = http.createServer((request, response)=>{
            setTimeout(() => {
                response.write('not important');
                response.end();
            }, timeout*10);
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

