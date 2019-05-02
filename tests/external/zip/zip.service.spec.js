const { expect } = require('chai');
const fs = require('fs');
const Server = require('../../../app/server/server');
const Database = require('../../../app/store/database');
const Migrator = require('../../../app/migrations/migrator');
const Truncator = require('../../support/truncator');
const { execute } = require('yop-postgresql');
const { request, requestbinary, localhost5000json } = require('../../support/request');
const { Readable } = require('stream');
const { unzipPdfsFromStream, extractFileNo } = require('../../support/file')

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

    it('is available', async ()=> {
        var promise = new Promise((resolve, reject)=>{
            requestbinary(zip, async (err, response, body)=>{
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal('application/zip');
                const stream = new Readable();
                stream._read = () => {
                    stream.push(body)
                    stream.push(null)
                }
                var files = await unzipPdfsFromStream(stream, extractFileNo)
                resolve(files)
            })
        })
        var files = await promise
        expect(files).to.deep.include({ path: 'form2-1.pdf', data: { fileno: '111' } })
        expect(files).to.deep.include({ path: 'form2-2.pdf', data: { fileno: '222' } })
        expect(files.length).to.equal(2)
    });

    it('resists unknow form', function(done) {
        request(localhost5000json({path: '/api/zip?id=1&id=666'}), (err, response, body)=>{
            expect(response.statusCode).to.equal(404);
            expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
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
