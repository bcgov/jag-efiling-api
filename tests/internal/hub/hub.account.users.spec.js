var expect = require('chai').expect;
var fs = require('fs');
var http = require('http');
var path = require('path');
var Hub = require('../../../app/hub/hub');

describe('Hub account users', () => {

    var hub;
    var server;
    var port = 8111;
    var ip = 'localhost';
    var far = 'http://' + ip + ':' + port;
    var receivedUrl, receivedMethod, receivedBody
    var willRespondWithStatus = 200;
    var willAnswerWith = {
        "soap:Envelope": {
            "@xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
            "soap:Body": {
                "ns2:getCsoClientProfilesResponse": {
                    "@xmlns:ns2": "http://csoextws.jag.gov.bc.ca/",
                    "return": {
                        "any": "thing"
                    }
                }
            }
        }
    }

    beforeEach((done) => {
        hub = new Hub(far);
        server = http.createServer((request, response) => {
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
        } else {
            done();
        }
    });

    it('sends the account-users request', (exit) => {
        hub.accountUsers('42', () => {
            expect(receivedUrl).to.equal('/accountUsers?userguid=42');
            expect(receivedMethod).to.equal('GET')
            exit();
        });
    });

    it('resists hub offline', (done) => {
        server.close(() => {
            hub.accountUsers('42', (data) => {
                expect(data).to.deep.equal({
                    error: {
                        code: 503
                    }
                });
                done();
            });
        });
    });

    it('resists hub errors', (done) => {
        willRespondWithStatus = 500
        hub.accountUsers('42', (data) => {
            expect(data).to.deep.equal({
                error: {
                    code: 500
                }
            });
            done();
        });
    });

    it('forwards the clean response', (exit) => {
        willRespondWithStatus = 200
        hub.accountUsers('42', (data) => {
            expect(data).to.deep.equal({
                any: 'thing'
            })
            exit();
        });
    });

    it('resists not found', (exit) => {
        willAnswerWith = 'NOT FOUND'
        willRespondWithStatus = 404
        hub.accountUsers('42', (data) => {
            expect(data).to.deep.equal({
                error: {
                    code: 404
                }
            });
            exit();
        });
    });

    it('resists timeout', function(done) {
        server.close(()=>{
            let timeout = 50;
            answer = (req, res)=>{
                setTimeout(()=>{
                    res.statusCode = 200;
                    res.end();
                }, timeout * 10);
            };
            hub = new Hub(far, timeout);
            server = http.createServer(answer).listen(port, ()=>{
                hub.accountUsers('', (data)=>{
                    expect(data).to.deep.deep.equal({ error: { code:503 } });
                    done();
                });
            });
        })
    });

});
