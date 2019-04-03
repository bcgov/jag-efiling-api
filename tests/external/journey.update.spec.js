var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');

describe('Journey update', function() {

    var server;
    var database;
    var update = localhost5000json({
        method: 'PUT',
        path: '/api/journey/1',
        body: {
            type: 'maxjourney',
            state: 'started',
            ca_number: 'CA123',
            steps: JSON.stringify([{type: 'best', state: 'two'}])
        }
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
        execute(background, ()=> {
            request(update, (err, response, body)=> {
                const sql = `
                    SELECT  journey.steps
                    FROM journey, person
                    WHERE journey.id=1
                    AND journey.userid=person.id
                `;
                execute(sql, function(rows) {
                    expect(rows.length).to.equal(1);
                    const { steps } = rows[0];
                    expect(steps).to.equal(JSON.stringify([{type: 'best', state: 'two'}]))
                    done();
                });
            });
        });
    });
});
