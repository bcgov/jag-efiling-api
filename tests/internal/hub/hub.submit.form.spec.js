var expect = require('chai').expect;
var fs = require('fs');
var http = require('http');
var path = require('path');
var Hub = require('../../../app/hub/hub');

describe('Hub submit-form', ()=> {

    var hub;
    var server;
    var port = 8111;
    var ip = 'localhost';
    var far = 'http://' + ip + ':' + port;
    var receivedUrl, receivedMethod, receivedBody
    var willRespondWithStatus = 200;
    var willAnswerWith = { alive:true }

    beforeEach((done)=> {
        hub = new Hub(far);
        server = http.createServer((request, response)=>{
            receivedMethod = request.method
            receivedUrl = request.url;
            receivedBody = ''
            request.on('data', (chunk) => {
                receivedBody += chunk
            })
            request.on('end', () => {
                response.statusCode = willRespondWithStatus
                response.setHeader('content-type', 'application/json');
                response.write(JSON.stringify(willAnswerWith));
                response.end();
            })
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

    it('extracts host from given url', ()=>{
        hub = new Hub('http://this-host')

        expect(hub.host).to.equal('this-host')
    })
    it('extracts host from given url without trailing slash', ()=>{
        hub = new Hub('http://this-host/')

        expect(hub.host).to.equal('this-host')
    })
    it('extracts host from given url first segment', ()=>{
        hub = new Hub('http://this-host/ignore-that')

        expect(hub.host).to.equal('this-host')
    })
    it('extracts host from given url with port', ()=>{
        hub = new Hub('http://this-host:50')

        expect(hub.host).to.equal('this-host')
    })
    it('extracts host from given url with port and several segments', ()=>{
        hub = new Hub('http://this-host:50/ignore-that')

        expect(hub.host).to.equal('this-host')
    })
    it('extracts port from given url', ()=>{
        hub = new Hub('http://this-host:50')

        expect(hub.port).to.equal(50)
    })
    it('extracts port from given url containing several segments', ()=>{
        hub = new Hub('http://this-host:5050/ignore-that')

        expect(hub.port).to.equal(5050)
    })
    it('extracts port and defaults to 80', ()=>{
        hub = new Hub('http://this-host/ignore-that')

        expect(hub.port).to.equal(80)
    })

    it('sends the submit request', (exit)=>{
        hub.submitForm('this-pdf', ()=> {
            expect(receivedUrl).to.equal('/save');
            expect(receivedMethod).to.equal('POST');
            expect(receivedBody).to.equal('this-pdf')
            exit();
        });
    });

    it('resists hub offline', (done)=>{
        server.close(()=>{
            hub.submitForm('this-pdf', (data)=> {
                expect(data).to.deep.equal({ error:{code:503} });
                done();
            });
        });
    });

    it('resists hub errors', (done)=>{
        willRespondWithStatus = 500
        hub.submitForm('this-pdf', (data)=> {
            expect(data).to.deep.equal({ error:{code:500} });
            done();
        });
    });

    it('forwards the response', (exit)=>{
        willRespondWithStatus = 200
        willAnswerWith = { all:'good' }
        hub.submitForm('this-pdf', (data)=> {
            expect(data).to.deep.equal({ all:'good' })
            exit();
        });
    });
});
