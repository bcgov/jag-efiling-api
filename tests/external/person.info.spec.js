var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var get = require('request');

describe('Person info endpoint', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;
    var database;
    var options = {
        url: home + '/api/persons/connected',
        headers: {
            'SMGOV_USERGUID': 'max',
            'SMGOV_USERDISPLAYNAME': 'Free Max'
        }
    };

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

    it('returns name', (done)=> {
        get(options, function(err, response, body) {
            expect(response.statusCode).to.equal(200);
            let person = JSON.parse(body);
            expect(person.login).to.equal('max');
            expect(person.name).to.equal('Free Max');
            done();
        });
    });

    it('returns customization', (done)=> {
        var background = [
            'alter sequence person_id_seq restart',
            { sql:'insert into person(login, customization) values ($1, $2)', params:['max', JSON.stringify({ thisApp:true })] }
        ];
        execute(background, function(rows, error) {
            expect(error).to.equal(null);
            get(options, function(err, response, body) {
                expect(response.statusCode).to.equal(200);
                let person = JSON.parse(body);
                expect(person.login).to.equal('max');
                expect(person.name).to.equal('Free Max');
                expect(person.customization).to.deep.equal({ thisApp:true });
                done();
            });
        });
    });

    it('resists unknown user', (done)=> {
        get(home + '/api/persons/connected', function(err, response, body) {
            expect(response.statusCode).to.equal(401);
            expect(JSON.parse(body)).to.deep.equal({message:'unauthorized'});
            done();
        });
    });
});
