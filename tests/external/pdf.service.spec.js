var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var request = require('request');
var fs = require('fs');
const PDFParser = require("pdf2json");
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
                'SMGOV_USERGUID': 'max'
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
    let xy = function(data) {
        return { 
            x:data.formImage.Pages[0].Texts[0].x,
            y:data.formImage.Pages[0].Texts[0].y
        }
    }
    let spaceBetween = function(actual, expected) {
        let actualPosition = xy(actual);
        let expectedPosition = xy(expected);

        if (actualPosition.y == expectedPosition.y) {
            return Math.abs(actualPosition.x - expectedPosition.x);
        }
        if (actualPosition.x == expectedPosition.x) {
            return Math.abs(actualPosition.y - expectedPosition.y);
        }
        return Math.abs(actualPosition.x - expectedPosition.x) * Math.abs(actualPosition.y - expectedPosition.y);
    }

    it('uses html', function(done) {
        readExpectedPdf('./tests/external/files/hello.world.pdf', (expected)=>{
            var options = {
                url: home + '/api/pdf',
                form:{
                    html: `
                    <html>
                        <head>
                            <style>
                                .align-right {
                                    text-align: right;
                                    font-family: sans-serif;
                                    font-size: 10px;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="align-right">A</div>
                        </body>
                    </html>`
                },
                headers: {
                    'SMGOV_USERGUID': 'max'
                },
                encoding: null
            };
            request.post(options, function(err, response, body) {
                parsePdf(body, (actual)=>{
                    if (!deepEqual(expected, actual)) {
                        fs.writeFileSync('./tests/external/files/hello.world-actual.pdf', body);
                    }
                    if (spaceBetween(actual, expected) > 1) {
                        console.log(xy(actual));
                        console.log(xy(expected));
                        expect(actual).to.deep.equal(expected);
                    }
                    done();
                });
            });
        });
    });
});