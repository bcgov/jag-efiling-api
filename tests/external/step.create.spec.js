let expect = require('chai').expect;
let Server = require('../../app/server/server');
let Database = require('../../app/store/database');
let Migrator = require('../../app/migrations/migrator');
let Truncator = require('../support/truncator');
let { execute } = require('yop-postgresql');
let request = require('request');

describe('Step create', function() {

    let server;
    let port = 5000;
    let ip = 'localhost';
    let home = 'http://' + ip + ':' + port;
    let database;

    beforeEach(function(done) {
        server = new Server();
        database = new Database();
        server.useDatabase(database);
        let migrator = new Migrator();
        migrator.migrateNow(function() {
            let truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                server.start(port, ip, done);
            });
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('is a rest service', function(done) {
        let background = [
            'alter sequence person_id_seq restart',
            'alter sequence journey_id_seq restart',
            'alter sequence step_id_seq restart',
            { sql: 'insert into person(login) values ($1)', params:['max'] }
        ];
        execute(background, (rows, error)=> {
            let journeyoptions = {
                url: home + '/api/journey',
                form: {
                    ca_number: 'CA123'
                },
                headers: {
                    'SMGOV_USERGUID': 'max'
                }
            };

            
            request.post(journeyoptions, function(err, response, body) {
                expect(response.statusCode).to.equal(201);
                const journeylocation = response.headers.location;
                const journey_id = parseInt(journeylocation.substring(journeylocation.lastIndexOf('/')+1));

                let stepoptions = {
                    url: home + '/api/step',
                    form: {
                        steptype: 'form2',
                        state: 'started',
                        journeyid: journey_id
                    },
                    headers: {
                        'SMGOV_USERGUID': 'max'
                    }
                };
                request.post(stepoptions, function(err, response, body) {
                    expect(response.statusCode).to.equal(201);
                    expect(body).to.deep.equal(JSON.stringify({id: 1}));
                    expect(response.headers.location).to.equal('/step/1');
                    const location = response.headers.location;
                    const id = parseInt(location.substring(location.lastIndexOf('/') + 1));


                    const sql = `
                        SELECT  step.id,
                                step.steptype,
                                step.state as state,
                                journey.id as journeyid,
                                person.login as login
                        FROM step, journey, person
                        WHERE step.id=$1
                        AND step.journeyid = journey.id
                        AND journey.userid=person.id
                    `;
                    execute(sql, [id], function(rows) {
                        expect(rows.length).to.equal(1);
                        const { steptype, state, journeyid, login } = rows[0];
                        expect(steptype).to.equal('form2');
                        expect(state).to.equal('started');
                        expect(journeyid).to.equal(journey_id);
                        expect(login).to.equal('max');
                        done();
                    });
                });
            });
        });
    });
});
