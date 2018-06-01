var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var request = require('request');
var fs = require('fs');
var PDFParser = require("pdf2json");
var deepEqual = require('deep-equal');

describe('PDF service', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;
    var database;

    beforeEach(function(done) {
        server = new Server();
        database = new Database();
        server.useDatabase(database);
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                server.start(port, ip, done);
            });
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('is available', function(done) {
        var options = {
            url: home + '/api/pdf',
            form:{
                html: '<html><body></body></html>'
            },
            headers: {
                'X-USER': 'max'
            }
        };
        request.post(options, function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            expect(response.headers['content-type']).to.equal('application/pdf');            
            done();
        });
    });

    let parser = function(callback) {
        let pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", errData => callback(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {            
            callback(pdfData);
        });
        return pdfParser;
    };
    let readExpectedPdf = function(filename, callback) {
        parser(callback).loadPDF(filename);
    };
    let parsePdf = function(buffer, callback) {
        parser(callback).parseBuffer(buffer);
    };

    it('uses html', function(done) {
        readExpectedPdf('./tests/external/files/hello.world.pdf', (expected)=>{
            var options = {
                url: home + '/api/pdf',
                form:{
                    html: `
                    <html>
                        <head>
                            <style>
                                body {
                                    padding: 0px;
                                    margin: 0px;
                                }
                                .align-right {
                                    padding: 0px;
                                    margin: 0px;
                                    text-align: center;
                                    font-family: sans-serif;
                                    font-size: 10px;
                                    font-style: normal;
                                    font-weight: normal;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="align-right">A</div>
                        </body>
                    </html>`
                },
                headers: {
                    'X-USER': 'max'
                },
                encoding: null
            };
            request.post(options, function(err, response, body) {
                parsePdf(body, (actual)=>{
                    if (!deepEqual(expected, actual)) {
                        fs.writeFileSync('./tests/external/files/hello.world-actual.pdf', body);
                    }
                    expect(actual).to.deep.equal(expected);
                    done();
                });
            });
        });
    });
});