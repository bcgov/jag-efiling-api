var expect = require('chai').expect;
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { Forms } = require('../../app/store/forms');

describe('Update existing form', function() {

    var database;
    var forms;
    var testform2;

    beforeEach(function(success) {
        database = new Database();
        forms = new Forms();
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                success();
            });
        });

    });

    it('updates the data', function(done) {
        const s1 = "this is the form for testing";
        const s2 = "Hey Siri. Tea, Earl Grey, hot.";
        testform2 = {
            type: 'form-2',
            data: { value: s1 }
        };

        database.createForm(testform2, function(newId) {
            testform2.id = newId;

            let updatingData = {
                id: newId,
                type: 'form-2',
                data: { value: s2 }
            };

            // I don't like this, having the update within the callback function.
            // TODO: SP - change to using Promises and wait for create to finish,
            // or make the creation happen in beforeEach.
            database.updateForm(updatingData, function(updatedId) {
                forms.selectOne(testform2.id, function(rows) {
                    expect(rows.length).to.equal(1);
                    const { type, status, data } = rows[0];
                    expect(updatedId).to.equal(testform2.id);
                    expect(type).to.equal('form-2');
                    expect(status).to.equal('Draft');
                    expect(data).to.equal(JSON.stringify({ value: s2 }));
                    done();
                });
            });
        });

    });
});
