var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');

describe('Extended my cases end point', function() {

    var server;
    var database;
    var creationByBob = localhost5000json({
        method: 'POST',
        path: '/api/forms',
        body: { data: JSON.stringify({ any:'field', authorizations:[{ clientId:222, isAdmin:true }] }) }
    });
    creationByBob.headers['SMGOV_USERGUID'] = 'bob'
    var mycasesByMax = localhost5000json({
        path: '/api/cases',
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
            { sql: 'insert into person(login, client_id) values ($1, $2)', params:['bob', 111] },
            { sql: 'insert into person(login, client_id) values ($1, $2)', params:['max', 222] }
        ];
        execute(background, (rows, error)=> {
            request(creationByBob, (err, response, body)=> {
                expect(response.statusCode).to.equal(201);

                request(mycasesByMax, (err, response, body)=> {
                    expect(response.statusCode).to.equal(200);

                    let cases = JSON.parse(body).cases
                    expect(cases.length).to.equal(1)

                    let theCase = cases[0];
                    expect(theCase.personId).to.equal(1);
                    expect(theCase.type).to.equal('form-2');
                    expect(theCase.status).to.equal('Draft');
                    done();
                });
            })
        });
    });
});
