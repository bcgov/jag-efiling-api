var expect = require('chai').expect;
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { Journey } = require('../../app/store/journey');
var { Step } = require('../../app/store/step');
var CreateJourney = require('../../app/features/create.journey');
var CreateStep = require('../../app/features/create.step');
var SavePerson = require('../../app/features/save.person');

describe('Create step', function() {

    let database;
    let journeys;
    let createJourney;
    let steps;
    let createStep;
    let savePerson;

    beforeEach(function(success) {
        database = new Database();
        createJourney = new CreateJourney(database);
        createStep = new CreateStep(database);
        savePerson = new SavePerson(database);
        journeys = new Journey();
        steps = new Step();
        const migrator = new Migrator();
        migrator.migrateNow(function() {
            let truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                success();
            });
        });
    });

    it('creates a step', function(done) {
        savePerson.now('jane', function(newUserId) {
            const journey = {
                type: 'respondtoleavetoappeal',
                state: 'started',
                ca_number: 'CA1234',
                userid: newUserId
            };
            createJourney.now(journey, function(journey_id) {
                expect(journey_id).not.to.equal(undefined);
                journeys.selectOne(journey_id, function(journeyRows) {
                    expect(journeyRows[0].id).to.equal(Number(journey_id));
                });
                let step = {
                    steptype: 'form2',
                    state:'started',
                    journeyid: journey_id,
                };
                createStep.now(step, function(step_id) {
                    expect((step_id)).not.to.equal(undefined);
                    steps.selectOne(step_id, function(rows) {
                        expect(rows[0].id).to.equal(Number(step_id));
                        expect(rows[0].steptype).to.equal('form2');
                        expect(rows[0].state).to.equal('started');
                        expect(rows[0].journeyid).to.equal(Number(journey_id))
                    })
                    done();
                })
            });
        });
    });
});
