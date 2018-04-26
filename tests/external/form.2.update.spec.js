var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var request = require('request');

describe('Form 2 update', function() {

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

    it('is a rest service', function(done) {
        var background = [
            'alter sequence person_id_seq restart',
            'alter sequence forms_id_seq restart',
            { sql: 'insert into person(login) values ($1)', params:['max'] },
            { sql: 'insert into forms(person_id, type, status, data) values($1, $2, $3, $4);', params:[1, 'crazy-max', 'new', JSON.stringify({field:'old value'})] },
        ];
        execute(background, (rows, error)=> {
            var options = {
                url: home + '/api/forms/1',
                form:{
                    token: 'any',
                    data: JSON.stringify({ field:'new value' })
                },
                headers: {
                    'X-USER': 'max'
                }
            };
            request.put(options, function(err, response, body) {
                expect(response.statusCode).to.equal(200);

                let sql = `
                   SELECT data
                   FROM forms
                   WHERE forms.id=$1
                `;
                execute(sql, [1], function(rows) {
                    expect(rows.length).to.equal(1);

                    let { data } = rows[0];
                    expect(data).to.equal(JSON.stringify({ field:'new value' }));
                    done();
                });
            });
        });
    });

    it('it updates the modified time', function(done) {

        let longAgo = new Date('1999-12-31 23:59:59');
        execute('select current_timestamp', [], function (rows) {
            // record time for comparison to modified date; test should take within one second to complete
            let recent = rows[0].current_timestamp;
            recent = new Date(recent);

            let background = [
                'alter sequence person_id_seq restart',
                'alter sequence forms_id_seq restart',
                {sql: 'insert into person(login) values ($1)', params: ['max']},
                {
                    sql: 'insert into forms(person_id, type, status, data, modified) values($1, $2, $3, $4, $5);',
                    params: [1, 'crazy-max', 'new', JSON.stringify({field: 'old value'}), longAgo]
                },
            ];
            execute(background, (rows, error) => {
                let options = {
                    url: home + '/api/forms/1',
                    form: {
                        token: 'any',
                        data: JSON.stringify({field: 'new value'})
                    },
                    headers: {
                        'X-USER': 'max'
                    }
                };
                request.put(options, function (err, response, body) {
                    expect(response.statusCode).to.equal(200);

                    let sql = `
                       SELECT data, modified
                       FROM forms
                       WHERE forms.id=$1
                    `;
                    execute(sql, [1], function (rows) {
                        expect(rows.length).to.equal(1);
                        let {data, modified} = rows[0];
                        let timeUpdated = new Date(modified);
                        let timeElapsed = timeUpdated - recent;
                        expect( timeElapsed < 1000 && timeElapsed > 0 ).to.equal(true);
                        expect(timeUpdated - longAgo).not.to.equal(0);
                        expect(data).to.equal(JSON.stringify({field: 'new value'}));
                        done();
                    });
                });
            });
        });
    });
});