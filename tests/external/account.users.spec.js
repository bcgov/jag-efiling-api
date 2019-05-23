var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var {
    execute
} = require('yop-postgresql');
var {
    request,
    localhost5000json
} = require('../support/request');

describe('Account users endpoint', function() {

    var server;
    var database;
    var info = localhost5000json({
        path: '/api/accountusers',
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

    it('optimizes the received answer', (done) => {
        var sent = {
            "account": {
                "accountId": "5",
                "clientId": "9"
            },
            "client": [{
                "clientId": "9",
                "givenName": "Leonardo",
                "isAdmin": "true",
                "surname": "DaVinci"
            }, {
                "clientId": "7",
                "givenName": "Francisco",
                "isAdmin": "false",
                "surname": "Goya"
            }, {
                "clientId": "8",
                "givenName": "Isaac",
                "isAdmin": "false",
                "surname": "Newton"
            }]
        }
        var expected = {
            "account": {
                "accountId": 5,
                "clientId": 9
            },
            "authorizations": [{
                "clientId": 9,
                "givenName": "Leonardo",
                "isAdmin": true,
                "isActive": true,
                "isEditable": false,
                "surname": "DaVinci"
            }, {
                "clientId": 7,
                "givenName": "Francisco",
                "isAdmin": false,
                "isActive": false,
                "isEditable": true,
                "surname": "Goya"
            }, {
                "clientId": 8,
                "givenName": "Isaac",
                "isAdmin": false,
                "isActive": false,
                "isEditable": true,
                "surname": "Newton"
            }]
        }
        server.useService({
            accountUsers: (login, callback) => {
                callback(sent)
            }
        })
        request(info, (err, response, body) => {
            expect(response.statusCode).to.equal(200);
            expect(JSON.parse(body)).to.deep.equal({ info:expected })
            done()
        });
    })
});
