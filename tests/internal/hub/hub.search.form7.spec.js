var expect = require('chai').expect;
var fs = require('fs');
var http = require('http');
var path = require('path');
var Hub = require('../../../app/hub/hub');

describe('Hub search-form-7', ()=> {

    var hub;
    var server;
    var port = 8111;
    var ip = 'localhost';
    var far = 'http://' + ip + ':' + port;
    var body = fs.readFileSync(path.join(__dirname, 'sample.json')).toString();
    var received;

    beforeEach((done)=> {
        hub = new Hub(far);
        server = http.createServer((request, response)=>{
            received = request.url;
            response.setHeader('content-type', 'application/json');
            response.write(body);
            response.end();
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

    it('sends the search request', (exit)=>{
        hub.searchForm7('this-id', (data)=> {
            expect(received).to.equal('/form7s?caseNumber=this-id');
            exit();
        });
    });

    it('provides expected info', (exit)=> {
        hub.searchForm7('any', (data)=> {
            expect(data).to.deep.equal({
                appellants: [
                    {
                        name:'Max FREE',
                        organization:'FREE Inc.',
                        solicitor: {
                            name:'John Smith',
                            address: {
                                addressLine1:'123 - Nice Street',
                                addressLine2:'B201',
                                city:'Here',
                                province:'British Columbia',
                                postalCode:'V1V 0M0'
                            }
                        }
                    },
                    {
                        name:'MAX SUPERFREE',
                        organization:'FREE Inc.',
                        solicitor: {
                            name:'John Smith',
                            address: {
                                addressLine1:'123 - Nice Street',
                                addressLine2:'B201',
                                city:'Here',
                                province:'British Columbia',
                                postalCode:'V1V 0M0'
                            }
                        }
                    }
                ],
                respondents: [
                    {
                        name:'Bob NOT SO FREE',
                        organization:'NOT FREE Inc.',
                        solicitor: {
                            name:'Jane Doe',
                            address: {
                                addressLine1:'456 - Near Street',
                                addressLine2:'A2',
                                city:'Far',
                                province:'British Columbia',
                                postalCode:'V2V 0M0'
                            }
                        }
                    },
                    {
                        name:'BOB NOT FREE',
                        organization:'NOT FREE Inc.',
                        solicitor: {
                            name:'Jane Doe',
                            address: {
                                addressLine1:'456 - Near Street',
                                addressLine2:'A2',
                                city:'Far',
                                province:'British Columbia',
                                postalCode:'V2V 0M0'
                            }
                        }
                    }
                ]
            });
            exit();
        });
    });

    it('propagates 404', (done)=>{
        server.close(()=>{
            server = http.createServer((request, response)=>{
                response.statusCode = 404;
                response.setHeader('content-type', 'application/json');
                response.write('NOT FOUND');
                response.end();
            }).listen(port, ()=>{
                hub.searchForm7('any', (data)=> {
                    expect(data).to.deep.equal({ error:{code:404} });
                    done();
                });
            });
        })
    });

    it('resists missing Legal representation', (exit)=>{
        body = fs.readFileSync(path.join(__dirname, 'sample.with.missing.legal.json')).toString();
        hub.searchForm7('any', (data)=> {
            expect(data).to.deep.equal({
                appellants: [
                    {
                        name:'Max FREE',
                        organization:'FREE Inc.',
                        solicitor: {
                            name:'John Smith',
                            address: {
                                addressLine1:'123 - Nice Street',
                                addressLine2:'B201',
                                city:'Here',
                                province:'British Columbia',
                                postalCode:'V1V 0M0'
                            }
                        }
                    },
                    {
                        name:'Max FREE',
                        organization:'FREE Inc.'
                    }
                ],
                respondents: [
                    {
                        name:'Bob NOT SO FREE',
                        organization:'NOT FREE Inc.'
                    }
                ]
            });
            exit();
        });
    });

    it('resists missing organization', (exit)=>{
        body = fs.readFileSync(path.join(__dirname, 'sample.with.missing.organization.json')).toString();
        hub.searchForm7('any', (data)=> {
            expect(data).to.deep.equal({
                appellants: [
                    {
                        name:'Max FREE'
                    }
                ],
                respondents: [
                ]
            });
            exit();
        });
    });

    it('resists missing name', (exit)=>{
        body = fs.readFileSync(path.join(__dirname, 'sample.with.missing.name.json')).toString();
        hub.searchForm7('any', (data)=> {
            expect(data).to.deep.equal({
                appellants: [
                    {
                        organization:'Freedom Inc.'
                    }
                ],
                respondents: [
                ]
            });
            exit();
        });
    });

    it('resists empty response', (exit)=>{
        body = fs.readFileSync(path.join(__dirname, 'empty.response.json')).toString();
        hub.searchForm7('any', (data)=> {
            expect(data).to.deep.equal({ error:{code:404} });
            exit();
        });
    });

    it('resists hub offline', (done)=>{
        server.close(()=>{
            hub.searchForm7('any', (data)=> {
                expect(data).to.deep.equal({ error:{code:503} });
                done();
            });
        });
    });

    it('doe not serve a criminal case', (done)=>{
        body = fs.readFileSync(path.join(__dirname, 'sample.criminal.case.json')).toString();
        hub.searchForm7('any', (data)=> {
            expect(data).to.deep.equal({ error:{code:404, message:'criminal'} });
            done();
        });
    });

    it('doe not serve a familly law case', (done)=>{
        body = fs.readFileSync(path.join(__dirname, 'sample.familly.law.json')).toString();
        hub.searchForm7('any', (data)=> {
            expect(data).to.deep.equal({ error:{code:404} });
            done();
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
                hub.searchForm7('', (data)=>{
                    expect(data).to.deep.deep.equal({ error: { code:503 } });
                    done();
                });
            });
        })
    });
});
