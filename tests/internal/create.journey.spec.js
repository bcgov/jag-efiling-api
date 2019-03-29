var expect = require('chai').expect;
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { Journey } = require('../../app/store/journey');
var CreateJourney = require('../../app/features/create.journey');
var SavePerson = require('../../app/features/save.person');

describe('Create journey', function() {

    var database;
    var journey;
    var createJourney;
    var savePerson;

    beforeEach(function(success) {        
        database = new Database();
        createJourney = new CreateJourney(database);
        savePerson = new SavePerson(database);
        journey = new Journey();
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
            var testJourney = {
                type: 'respondtoleavetoappeal',
                state: 'started',
                ca_number: 'CA1234',
                userid: newUserId,
                steps: "unimportant"
            };
            createJourney.now(testJourney, function(journey_id) {
                expect(journey_id).not.to.equal(undefined);
                journey.selectOne(journey_id, function(rows) {
                    expect(rows[0].id).to.equal(Number(journey_id));
                    expect(rows[0].type).to.equal('respondtoleavetoappeal');
                    expect(rows[0].userid).to.equal(Number(newUserId));
                    expect(rows[0].state).to.equal('started');
                    expect(rows[0].steps).to.equal('unimportant');
                    expect(rows[0].ca_number).to.equal('CA1234');
                    done()
                });
            });
        });
    });

    it('creates only one journey per user', function(done) {

        savePerson.now('jane', function(newUserId) {
            var testJourney = {
                type: 'respondtoleavetoappeal',
                state: 'started',
                ca_number: 'CA1234',
                userid: newUserId,
                steps: "unimportant"
            };
            var modifiedJourney = {
                type: 'appellantrighttoappeal',
                state: 'completed',
                ca_number: 'CA1234',
                userid: newUserId,
                steps: "blah blah blah"
            }
            createJourney.now(testJourney, function(journey_id) {
                console.log("Created first journey", journey_id)
                expect(journey_id).not.to.equal(undefined);
                journey.selectAll(function(rows) {
                    expect(rows.length).to.equal(1);
                    expect(rows[0].id).to.equal(Number(journey_id));
                    createJourney.now(modifiedJourney, function(next_journey_id) {
                        expect(next_journey_id).not.to.equal(undefined);
                        expect(next_journey_id).to.equal(journey_id);
                        journey.selectAll(function(rows) {
                            expect(rows.length).to.equal(1);
                            expect(rows[0].id).to.equal(Number(journey_id));
                            expect(rows[0].type).to.equal('appellantrighttoappeal');
                            expect(rows[0].userid).to.equal(Number(newUserId));
                            expect(rows[0].state).to.equal('completed');
                            expect(rows[0].steps).to.equal('blah blah blah');
                            expect(rows[0].ca_number).to.equal('CA1234');
                            done()
                        });
                    });
                });
            });
        });
    });
});
