var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var get = require('request');

describe('My cases endpoint', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;
    var database;

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

    it('is a rest service', function(done){
        var background = [
            'alter sequence person_id_seq restart',
            { sql:'insert into person(login) values ($1)', params:['bob'] },
            { sql:'insert into person(login) values ($1)', params:['max'] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-bob', 'new', JSON.stringify({value:'bob'})] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[2, 'crazy-max', 'new', JSON.stringify({value:'max'})] },
            'select last_value from forms_id_seq'
        ];
        execute(background, function(rows) {
            var newId = parseInt(rows[0].last_value);
            var options = {
                url: home + '/api/cases',
                headers: {
                    'SMGOV_USERGUID': 'max'
                }
            };
            get(options, (err, response, body)=> {
                expect(response.statusCode).to.equal(200);
                let theCase = JSON.parse(body).cases[0];

                expect(theCase.id).to.equal(newId);
                expect(theCase.type).to.equal('crazy-max');
                expect(theCase.status).to.equal('new');
                expect(theCase.data).to.deep.equal({value:'max'});
                expect(new Date()-new Date(theCase.modified)).to.be.lessThan(2000);
                done();
            });
        });
    });

    it('ignores archived case', function(done){
        var background = [
            'alter sequence person_id_seq restart',
            { sql:'insert into person(login) values ($1)', params:['max'] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'archived', JSON.stringify({value:'max'})] },
            'select last_value from forms_id_seq'
        ];
        execute(background, function(rows) {
            var newId = parseInt(rows[0].last_value);
            var options = {
                url: home + '/api/cases',
                headers: {
                    'SMGOV_USERGUID': 'max'
                }
            };
            get(options, (err, response, body)=> {
                expect(response.statusCode).to.equal(200);                
                let cases = JSON.parse(body).cases;
                
                expect(cases.length).to.equal(0);
                done();
            });
        });
    });
});
