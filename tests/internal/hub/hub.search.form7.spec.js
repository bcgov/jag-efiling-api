var expect = require('chai').expect;
var fs = require('fs');
var http = require('http');
var Hub = require('../../../app/hub/hub');

describe('Hub search-form-7', ()=> {

    var hub;
    var server;
    var port = 8111;
    var ip = 'localhost';
    var far = 'http://' + ip + ':' + port;
    var body = fs.readFileSync('./tests/internal/hub/sample.json').toString();
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
                        sollicitor: {
                            name:'John Smith',
                            address:'123 - Nice Street B201 Here V1V 0M0'
                        }
                    },
                    {
                        name:'MAX SUPERFREE',
                        organization:'FREE Inc.',
                        sollicitor: {
                            name:'John Smith',
                            address:'123 - Nice Street B201 Here V1V 0M0'
                        }
                    }
                ],
                respondents: [
                    {
                        name:'Bob NOT SO FREE',
                        organization:'NOT FREE Inc.',
                        sollicitor: {
                            name:'Jane Doe',
                            address:'456 - Near Street A2 Far V2V 0M0'
                        }
                    },
                    {
                        name:'BOB NOT FREE',
                        organization:'NOT FREE Inc.',
                        sollicitor: {
                            name:'Jane Doe',
                            address:'456 - Near Street A2 Far V2V 0M0'
                        }
                    }
                ]
            });
            exit();
        });
    });
});