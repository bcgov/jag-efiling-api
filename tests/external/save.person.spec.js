var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');

describe('Person save', function() {

    var server;
    var database;
    var options = localhost5000json({
        method: 'POST',
        path: '/api/persons',
        body:{
            data: 'joe'
        }
    })

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
        request(options, (err, response, body)=> {
            expect(response.statusCode).to.equal(201);
            var location = response.headers.location;
            expect(location).to.contain('/persons/');
            var id = parseInt(location.substring(location.lastIndexOf('/')+1));

            execute('SELECT id, login FROM person where id=$1', [id], function(err, rows) {
                expect(rows.length).to.equal(1);

                var { login } = rows[0];
                expect(login).to.equal('joe');
                done();
            });
        });
    });

    it('does not duplicate entries', function(done) {
        request(options, (err, response, body)=> {

            expect(response.statusCode).to.equal(201);
            var location = response.headers.location;
            expect(location).to.contain('/persons/');
            var id = parseInt(location.substring(location.lastIndexOf('/')+1));

            request(options, function(err, response, body) {

                expect(response.statusCode).to.equal(201);
                var location = response.headers.location;
                expect(location).to.equal('/persons/' + id);

                execute('SELECT id, login FROM person where login=$1', ['joe'], function(err, rows) {
                    expect(rows.length).to.equal(1);
                    done();
                });
            });
        });
    });
});
