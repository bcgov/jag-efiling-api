var expect = require('chai').expect;
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { Journey } = require('../../app/store/journey');
var CreateJourney = require('../../app/features/create.journey');
let UpdateJourney = require('../../app/features/update.journey');
var SavePerson = require('../../app/features/save.person');

describe('Update journey', function() {

    var database;
    var journeys;
    var createJourney;
    var savePerson;
    let updateJourney;

    beforeEach(function(success) {
        database = new Database();
        createJourney = new CreateJourney(database);
        savePerson = new SavePerson(database);
        updateJourney = new UpdateJourney(database);
        journeys = new Journey();
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                success();
            });
        });
    });

    it('updates a journey', function(done) {

        savePerson.now('jane', function(newUserId) {
            const journey = {
                type: 'respondtoleavetoappeal',
                state: 'started',
                ca_number: 'CA1234',
                userid: newUserId,
                steps: '{some steps}'
            };
            const updatedJourney = {
                type: 'respondtoaappeal',
                state: 'someotherstate',
                ca_number: 'CA12345',
                userid: newUserId,
                steps: '{some other steps}'
            };
            createJourney.now(journey, function(journey_id) {
                expect(journey_id).not.to.equal(undefined);
                updatedJourney.id = journey_id;

                updateJourney.now( journey_id, updatedJourney, function(updated_journey_id) {
                    expect(updated_journey_id).not.to.equal(undefined);
                    journeys.selectOne(journey_id, function(rows) {
                        expect(rows[0].id).to.equal(Number(journey_id));
                        expect(rows[0].type).to.equal('respondtoaappeal');
                        expect(rows[0].userid).to.equal(Number(newUserId));
                        expect(rows[0].state).to.equal('someotherstate');
                        expect(rows[0].ca_number).to.equal('CA12345');
                        done()
                    });
                });
            });
        });
    });
});
