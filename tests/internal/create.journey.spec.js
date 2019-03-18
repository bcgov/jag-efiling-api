var expect = require('chai').expect;
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { Journey } = require('../../app/store/journey');
var CreateJourney = require('../../app/features/create.journey');
var SavePerson = require('../../app/features/save.person');

describe('Create journey', function() {

    var database;
    var journeys;
    var createJourney;
    var savePerson;

    beforeEach(function(success) {        
        database = new Database();
        createJourney = new CreateJourney(database);
        savePerson = new SavePerson(database);
        journeys = new Journey();
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                success();
            });
        });
    });

    it('creates a journey', function(done) {
        
        savePerson.now('jane', function(newUserId) {
            var journey = {
                type: 'respondtoleavetoappeal',
                state: 'started',
                ca_number: 'CA1234',
                userid: newUserId
            };
            createJourney.now(journey, function(journey_id) {
                expect(journey_id).not.to.equal(undefined);
                journeys.selectOne(journey_id, function(rows) {
                    expect(rows[0].id).to.equal(Number(journey_id));
                    expect(rows[0].type).to.equal('respondtoleavetoappeal');
                    expect(rows[0].userid).to.equal(Number(newUserId));
                    expect(rows[0].state).to.equal('started');
                    expect(rows[0].ca_number).to.equal('CA1234');
                    done()
                });
            });
        });
    });
});
