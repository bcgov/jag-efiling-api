var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');

describe('Journey read', function() {

    var server;
    var database;
    var myjourney = localhost5000json({
        path: '/api/journey'
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
            'alter sequence journey_id_seq restart',
            { sql: 'insert into person(login) values ($1)', params:['max'] },
            { sql: 'insert into journey(userid) values ($1)', params:[1] }
        ];
        execute(background, (error, rows)=> {
            request(myjourney, (err, response, body)=> {
                expect(response.statusCode).to.equal(200);
                var journey = JSON.parse(body).journey
                expect(journey.id).to.equal(1);
                expect(journey.userid).to.equal(1);
                done();
            });
        });
    });

    it('resists no journey for given user', function(done) {
        var background = [
            'alter sequence person_id_seq restart',
            'alter sequence journey_id_seq restart',
            { sql: 'insert into person(login) values ($1)', params:['max'] }
        ];
        execute(background, (error, rows)=> {
            request(myjourney, (err, response, body)=> {
                expect(response.statusCode).to.equal(404);
                done();
            });
        });
    });
});
