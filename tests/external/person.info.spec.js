var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');

describe('Person info endpoint', function() {

    var server;
    var database;
    var info = localhost5000json({
        path: '/api/persons/connected',
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

    it('returns name', (done)=> {
        request(info, (err, response, body)=> {
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
            expect(error).to.equal(undefined);
            request(info, (err, response, body)=> {
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
        var info = {
            host: 'localhost',
            port: 5000,
            path: '/api/persons/connected'
        }
        request(info, (err, response, body)=> {
            expect(response.statusCode).to.equal(401);
            expect(JSON.parse(body)).to.deep.equal({message:'unauthorized'});
            done();
        });
    });

    it('resists unregistered user', (done)=>{
        request(info, (err, response, body)=> {
            expect(response.statusCode).to.equal(200);
            let person = JSON.parse(body);
            expect(person.login).to.equal('max');
            expect(person.name).to.equal('Free Max');
            expect(person.customization).to.equal(undefined);
            done();
        });
    });
});
