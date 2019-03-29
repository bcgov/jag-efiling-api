var expect = require('chai').expect;
var Server = require('../../../app/server/server');
var Database = require('../../../app/store/database');
var Migrator = require('../../../app/migrations/migrator');
var Truncator = require('../../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../../support/request');
var fs = require('fs');

describe('Form 2 preview', function() {

    var server;
    var database;
    var preview = localhost5000json({
        path: '/api/forms/1/preview',
    });

    beforeEach(function(done) {
        server = new Server();
        database = new Database();
        server.useDatabase(database);
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                server.start(5000, 'localhost', done);
            });
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('is a rest service', function(done) {
        var data = fs.readFileSync('./tests/external/preview/form2.json').toString();
        var background = [
            'alter sequence person_id_seq restart',
            'alter sequence forms_id_seq restart',
            { sql: 'insert into person(login) values ($1)', params:['max'] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'new', data] },
        ];
        execute(background, (rows, error)=> {
            request(preview, (err, response, body)=> {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal('text/html');
                expect(body).to.equal(fs.readFileSync('./tests/external/preview/expected.preview.html').toString());
                done();
            });
        });
    });
    it('resists unknown form', (done)=>{
        var data = fs.readFileSync('./tests/external/preview/form2.json').toString();
        var background = [
            'alter sequence person_id_seq restart',
            'alter sequence forms_id_seq restart',
            { sql: 'insert into person(login) values ($1)', params:['max'] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'new', data] },
        ];
        execute(background, (rows, error)=> {
            var preview = localhost5000json({
                path: '/api/forms/2/preview',
            });
            request(preview, (err, response, body)=> {
                expect(response.statusCode).to.equal(404);
                expect(response.headers['content-type']).to.equal('application/json');
                expect(body).to.deep.equal(JSON.stringify({message:'not found'}));
                done();
            });
        });
    });
    it('includes email when specified', (done)=>{
        var data = fs.readFileSync('./tests/external/preview/form2.json').toString();
        data = data.replace('"useServiceEmail": false,', '"useServiceEmail": true,')
        var background = [
            'alter sequence person_id_seq restart',
            'alter sequence forms_id_seq restart',
            { sql: 'insert into person(login) values ($1)', params:['max'] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'new', data] },
        ];
        execute(background, (rows, error)=> {
            var preview = localhost5000json({
                path: '/api/forms/1/preview',
            });
            request(preview, (err, response, body)=> {
                expect(err).to.equal(null);
                expect(response.statusCode).to.equal(200);
                expect(response.headers['content-type']).to.equal('text/html');
                expect(body).to.equal(fs.readFileSync('./tests/external/preview/expected.preview.with.email.html').toString());
                done();
            });
        });
    });
});
