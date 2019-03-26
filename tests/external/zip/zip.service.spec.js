var expect = require('chai').expect;
var Server = require('../../../app/server/server');
var Database = require('../../../app/store/database');
var Migrator = require('../../../app/migrations/migrator');
var Truncator = require('../../support/truncator');
var { execute } = require('yop-postgresql');
var { request, requestbinary, localhost5000json } = require('../../support/request');
var fs = require('fs');
const PDFParser = require("pdf2json");
const { Transform } = require('stream');
var unzip = require('unzip-stream');
const { Readable } = require('stream');

describe('ZIP service', function() {

    var server;
    var database;
    var zip = localhost5000json({
        path: '/api/zip?id=1&id=2'
    })

    beforeEach(function(done) {
        server = new Server();
        database = new Database();
        server.useDatabase(database);
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                server.start(5000, 'localhost', ()=>{
                    var json1 = fs.readFileSync('./tests/external/zip/form2-111.json').toString();
                    var json2 = fs.readFileSync('./tests/external/zip/form2-222.json').toString();
                    var background = [
                        'alter sequence person_id_seq restart',
                        'alter sequence forms_id_seq restart',
                        { sql: 'insert into person(login) values ($1)', params:['max'] },
                        { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'any-status', json1] },
                        { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'any-status', json2] }
                    ];
                    execute(background, (rows, error)=> {
                        expect(error).to.equal(undefined);
                        done();
                    });
                });
            });
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('is available', function(done) {
        var files = [];
        requestbinary(zip, (err, response, body)=>{
            expect(response.statusCode).to.equal(200);
            expect(response.headers['content-type']).to.equal('application/zip');
            const stream = new Readable();
            stream._read = () => {
                stream.push(body)
                stream.push(null)
            }
            stream
                .pipe(unzip.Parse())
                .on('entry', function (entry) {
                    files.push(entry.path);
                    entry.autodrain();
                })
                .on('end', ()=>{
                    expect(files).to.include('form2-1.pdf');
                    expect(files).to.include('form2-2.pdf');
                    expect(files.length).to.equal(2);
                    done();
                });
        })
    });

    it('delivers', function(done) {
        requestbinary(localhost5000json({path: '/api/zip?id=1'}), (err, response, body)=>{
            const stream = new Readable();
            stream._read = () => {
                stream.push(body)
                stream.push(null)
            }
            stream
                .pipe(unzip.Parse())
                .on('entry', function (entry) {
                    var extractFileNo = function(page) {
                        var start = 52;
                        var fileNo = '';
                        for (var i=start; i<start+3; i++) {
                            fileNo += page.Texts[i].R[0].T;
                        }
                        return fileNo;
                    }
                    let json = new Transform();
                    json._writableState.objectMode = true;
                    json._transform = function(data) {
                        let page = data.formImage.Pages[0];

                        expect(extractFileNo(page)).to.equal('111');
                        done();
                    };
                    entry.pipe(new PDFParser()).pipe(json);
                });
        })
    });

    it('resists unknow form', function(done) {
        request(localhost5000json({path: '/api/zip?id=1&id=666'}), (err, response, body)=>{
            expect(response.statusCode).to.equal(404);
            expect(response.headers['content-type']).to.equal('application/json');
            expect(body).to.deep.equal(JSON.stringify({message:'not found'}));
            done();
        });
    });

    it('resists long id', function(done) {
        execute('update forms set id=11111 where id=1', (rows, error)=> {
            expect(error).to.equal(undefined);
            request(localhost5000json({path: '/api/zip?id=11111'}), (err, response, body)=>{
                expect(response.statusCode).to.equal(200);
                done();
            });
        });
    });
});
