var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');

describe('Form 2 archive', function() {

    var server;
    var database;
    var archiving = localhost5000json({
        method: 'POST',
        path: '/api/cases/archive',
        body: { ids:JSON.stringify([2, 3]) }
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

    it('can archive one case', function(done) {
        var background = [
            'alter sequence person_id_seq restart',
            'alter sequence forms_id_seq restart',
            { sql: 'insert into person(login) values ($1)', params:['max'] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'any-status', 'any-data'] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'any-status', 'any-data'] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'any-status', 'any-data'] },
        ];
        execute(background, (error, rows)=> {
            request(archiving, (err, response, body)=> {
                expect(response.statusCode).to.equal(200);
                expect(body).to.deep.equal(JSON.stringify({}));

                let sql = `
                   SELECT id, status
                   FROM forms
                   order by id
                `;
                execute(sql, [], function(err, rows) {
                    expect(rows.length).to.equal(3);

                    expect(rows[0].status).to.equal('any-status');
                    expect(rows[1].status).to.equal('archived');
                    expect(rows[2].status).to.equal('archived');
                    done();
                });
            })
        });
    });
});
