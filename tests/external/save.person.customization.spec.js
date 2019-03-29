var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');

describe('Customization save', function() {

    var server;
    var database;
    var customization = localhost5000json({
        method: 'POST',
        path: '/api/persons/customization',
        body: { customization:JSON.stringify({ thisApp:true }) },
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

    it('updates the user data', (done)=> {
        var background = [
            'alter sequence person_id_seq restart',
            { sql:'insert into person(login, customization) values ($1, $2)', params:['max', JSON.stringify({ thisApp:false })] }
        ];
        execute(background, function(rows, error) {
            request(customization, function(err, response, body) {
                expect(response.statusCode).to.equal(200);

                execute('SELECT id, login, customization FROM person where id=$1', [1], function(rows) {
                    expect(rows.length).to.equal(1);

                    var { customization } = rows[0];
                    expect(customization).to.equal(JSON.stringify({ thisApp:true }));


                    request(localhost5000json({ path: '/api/persons/connected' }), function(err, response, body) {
                        expect(response.statusCode).to.equal(200);
                        let person = JSON.parse(body);
                        expect(person.login).to.equal('max');
                        expect(person.name).to.equal('Free Max');
                        expect(person.customization).to.deep.equal({ thisApp:true });

                        done();
                    });
                });
            });
        });
    });

    it('creates user if not exist', (done)=>{
        var background = [
            'alter sequence person_id_seq restart'
        ];
        execute(background, function(rows, error) {
            request(customization, function(err, response, body) {
                expect(response.statusCode).to.equal(200);

                execute('SELECT id, login, customization FROM person where id=$1', [1], function(rows) {
                    expect(rows.length).to.equal(1);

                    var { customization } = rows[0];
                    expect(customization).to.equal(JSON.stringify({ thisApp:true }));


                    request(localhost5000json({ path: '/api/persons/connected' }), function(err, response, body) {
                        expect(response.statusCode).to.equal(200);
                        let person = JSON.parse(body);
                        expect(person.login).to.equal('max');
                        expect(person.name).to.equal('Free Max');
                        expect(person.customization).to.deep.equal({ thisApp:true });

                        done();
                    });
                });
            });
        });
    });
});
