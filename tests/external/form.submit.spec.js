var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');
var fs = require('fs');

describe('Form submit', function() {

    var server;
    var submit = localhost5000json({
        method: 'POST',
        path: '/api/forms/1/submit'
    })

    beforeEach(function(done) {
        server = new Server();
        database = new Database();
        server.useDatabase(database);
        server.useService({
            submitForm: function(pdf, callback) {
                callback({ field:'value' });
            }
        });
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                var data = fs.readFileSync('./tests/external/preview/form2.json').toString();
                var background = [
                    'alter sequence person_id_seq restart',
                    'alter sequence forms_id_seq restart',
                    { sql: 'insert into person(login) values ($1)', params:['max'] },
                    { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'new', data] },
                ];
                execute(background, (rows, error)=> {
                    server.start(5000, 'localhost', done);
                });
            });
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('is a rest service', function(done) {
        request(submit, (err, response, body)=> {
            expect(response.statusCode).to.equal(201);
            expect(JSON.parse(body)).to.deep.equal({ field:'value' });
            done();
        });
    });

    it('resists unknown form', function(done) {
        server.useService({
            submitForm: function(pdf, callback) {
                callback({ error: {code:404} });
            }
        });
        submit.path = '/api/forms/666/submit'
        request(submit, (err, response, body)=> {
            expect(response.statusCode).to.equal(404);
            expect(JSON.parse(body)).to.deep.equal({message:'not found'});
            done();
        });
    });
});
