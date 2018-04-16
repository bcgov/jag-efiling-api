var expect = require('chai').expect;
var Server = require('../../app/server/server');
var alwaysValid = require('../support/token.always.valid.js');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var request = require('request');

describe('Form 2 save', function() {

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

    it('is a rest service', function(done) {
        var options = {
            url: home + '/api/forms',
            form:{
                token: 'any',
                data: JSON.stringify({ any:'field' })
            },
            headers: {
                'X-USER': 'max'
            }
        };
        request.post(options, function(err, response, body) {
            expect(response.statusCode).to.equal(201);
            var location = response.headers.location;
            expect(location).to.contain('/forms/');
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
        });
    });

    it('is a rest service that requires a valid token', function(done) {
        server.useTokenValidator({
            validate: function(token, callback) {
                callback(false);
            }
        });
        request.post(home + '/api/forms', {form:{
            token: 'any',
            data: JSON.stringify({ any:'field' })
        }}, function(err, response, body) {
            expect(response.statusCode).to.equal(403);
            expect(body).to.equal('');
            done();
        });
    });
});
