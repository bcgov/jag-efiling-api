var expect = require('chai').use(require('chai-bytes')).expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var request = require('request');
var fs = require('fs');
var PDFParser = require("pdf2json");
var { Promise, Promises } = require('yop-promises');

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

    it('uses html', function(done) {
        let expected = 'expected';
        let actual = 'actual';
        
        var readExpected = new Promise();
        let pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", errData => readExpected.reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => {            
            expected = pdfData;
            readExpected.resolve();
        });
        pdfParser.loadPDF('./tests/external/files/hello.world.pdf');

        var readActual = new Promise();
        var options = {
            url: home + '/api/pdf',
            form:{
                html: '<html><body>hello world</body></html>'
            },
            headers: {
                'X-USER': 'max'
            },
            encoding: null
        };
        request.post(options, function(err, response, body) {
            var expected = fs.readFileSync('./tests/external/files/hello.world.pdf');
            let pdfParser = new PDFParser();
            pdfParser.on("pdfParser_dataError", errData => readActual.reject(errData.parserError));
            pdfParser.on("pdfParser_dataReady", pdfData => {
                actual = pdfData;
                readActual.resolve();
            });
            pdfParser.parseBuffer(body);
        });

        var just = new Promises();
        just.done(()=>{
            expect(actual).to.deep.equal(expected);
            done();
        })
        just.waitFor(readExpected);
        just.waitFor(readActual);
    });
});