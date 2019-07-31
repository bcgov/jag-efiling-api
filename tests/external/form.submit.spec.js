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
    var sentPdf, sentUserId, sentFormData;

    beforeEach(function(done) {
        server = new Server();
        database = new Database();
        server.useDatabase(database);
        server.useService({
            submitForm: function(userguid, formData, pdf, callback) {
                sentUserId = userguid;
                sentFormData = formData;
                sentPdf = pdf;
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
                execute(background, (error, rows)=> {
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
            submitForm: function(userguid, pdf, callback) {
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

    it('sends the expected pdf', function(done) {
        submit.path = '/api/forms/1/submit'
        request(submit, (err, response, body)=> {
            expect(Buffer.isBuffer(sentPdf)).to.equal(true);
            expect(sentPdf.length).to.equal(21232)
            done();
        });
    });

    it('sends the login info', function(done) {
        submit.path = '/api/forms/1/submit'
        request(submit, (err, response, body)=> {
            expect(sentUserId).to.equal('max')
            done();
        });
    });

    it('resists payment failure', function(done) {
        server.useService({
            submitForm: function(userguid, formData, pdf, callback) {
                callback({ error: {code:403, message:'payment failed'} });
            }
        });
        submit.path = '/api/forms/1/submit'
        request(submit, (err, response, body)=> {
            expect(response.statusCode).to.equal(403);
            expect(JSON.parse(body)).to.deep.equal({message:'payment failed'});
            done();
        });
    });

    it('sends the form data', function(done) {
        submit.path = '/api/forms/1/submit'
        request(submit, (err, response, body)=> {
            var data = fs.readFileSync('./tests/external/preview/form2.json').toString();
            var expected = JSON.parse(data);
            expect(sentFormData).to.deep.equal(expected)
            done();
        });
    });
});
