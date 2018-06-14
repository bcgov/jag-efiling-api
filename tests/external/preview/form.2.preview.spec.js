var expect = require('chai').expect;
var Server = require('../../../app/server/server');
var Database = require('../../../app/store/database');
var Migrator = require('../../../app/migrations/migrator');
var Truncator = require('../../support/truncator');
var { execute } = require('yop-postgresql');
var request = require('request');
var fs = require('fs');

describe('Form 2 preview', function() {

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

    it('is a rest service', function(done) {
        var data = fs.readFileSync('./tests/external/preview/form2.json').toString();
        var background = [
            'alter sequence person_id_seq restart',
            'alter sequence forms_id_seq restart',
            { sql: 'insert into person(login) values ($1)', params:['max'] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'new', data] },
        ];
        execute(background, (rows, error)=> {
            var options = {
                url: home + '/api/forms/1/preview',
                headers: {
                    'X-USER': 'max'
                }
            };
            request.get(options, function(err, response, body) {
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
            var options = {
                url: home + '/api/forms/2/preview',
                headers: {
                    'X-USER': 'max'
                }
            };
            request.get(options, function(err, response, body) {
                expect(response.statusCode).to.equal(404);
                expect(response.headers['content-type']).to.equal('application/json');
                expect(body).to.deep.equal(JSON.stringify({message:'not found'}));
                done();
            });
        });
    });
});