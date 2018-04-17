var expect = require('chai').expect;
var Server = require('../../app/server/server');
var alwaysValid = require('../support/token.always.valid.js');
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
        server.useTokenValidator(alwaysValid);
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
        execute('select current_timestamp', [], function(rows) {
            var now = rows[0].current_timestamp;
            now = JSON.stringify(now).toString();
            now = now.substring(1, now.lastIndexOf('.'))+'Z';

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
                    url: home + '/api/cases?token=any',
                    headers: {
                        'X-USER': 'max'
                    }
                };
                get(options, (err, response, body)=> {
                    expect(response.statusCode).to.equal(200);
                    expect(JSON.parse(body)).to.deep.equal({
                        cases: [
                            { id:newId, type:'crazy-max', modified:now, status:'new', data:{value:'max'} }
                        ]
                    });
                    done();
                });
            });
        });
    });

    it('is a rest service that requires a valid token', function(done){
        server.useTokenValidator({
            validate: function(token, callback) {
                callback(false);
            }
        });
        execute('select current_timestamp', [], function(rows) {
            var now = rows[0].current_timestamp;
            now = JSON.stringify(now).toString();
            now = now.substring(1, now.lastIndexOf('.'))+'Z';

            execute('insert into forms(type, status, data) values($1, $2, $3);',
                ['crazy', 'new', JSON.stringify({value:42})], function() {
                execute('select last_value from forms_id_seq', [], function(rows) {
                    var newId = parseInt(rows[0].last_value);

                    get(home + '/api/cases?token=any', function(err, response, body) {
                        expect(response.statusCode).to.equal(403);
                        expect(body).to.deep.equal('');
                        done();
                    });
                });
            });
        });
    });
});
