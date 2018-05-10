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
        server.close(done);
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
                    expect(data).to.equal('404:NOT FOUND');
                    done();
                });    
            });
        })
    });
});