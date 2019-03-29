var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');

describe('Form 2 create', function() {

    var server;
    var database;
    var creation = localhost5000json({
        method: 'POST',
        path: '/api/forms',
        body: { data: { any:'field' } }
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
        var background = [
            'alter sequence person_id_seq restart',
            'alter sequence forms_id_seq restart',
            { sql: 'insert into person(login) values ($1)', params:['max'] }
        ];
        execute(background, (rows, error)=> {
            request(creation, (err, response, body)=> {
                expect(response.statusCode).to.equal(201);
                expect(body).to.deep.equal(JSON.stringify({id:1}));
                expect(response.headers.location).to.equal('/forms/1');
                var location = response.headers.location;
                var id = parseInt(location.substring(location.lastIndexOf('/')+1));

                var sql = `
                    SELECT  forms.id,
                            type,
                            status,
                            data,
                            person.login as login
                    FROM forms, person
                    WHERE forms.id=$1
                    AND forms.person_id=person.id
                `;
                execute(sql, [id], function(rows) {
                    expect(rows.length).to.equal(1);

                    var { type, status, data, login } = rows[0];
                    expect(type).to.equal('form-2');
                    expect(status).to.equal('Draft');
                    expect(data).to.equal(JSON.stringify({ any:'field' }));
                    expect(login).to.equal('max');
                    done();
                });
            })
        });
    });
});
