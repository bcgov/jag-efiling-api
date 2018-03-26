var expect = require('chai').expect;
var Database = require('../../app/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { localhost } = require('../support/postgres.client.factory');
var { Forms } = require('../../app/store/forms');

describe('Save form', function() {

    var database;

    beforeEach(function(done) {
        database = new Database(localhost);
        forms = new Forms(localhost);
        var migrator = new Migrator(localhost);
        migrator.migrateNow(function() {
            var truncator = new Truncator(localhost);
            truncator.truncateTablesNow(function() {
                done();
            });
        });
    });

    it('defaults status to draft', function(done) {
        var form = {
            type: 'form-2',
            data: { value:42 }
        };
        database.saveForm(form, function(newId) {            
            expect(newId).not.to.equal(undefined);
            forms.selectAll(function(rows) {
                expect(rows.length).to.equal(1);
                var { id, type, status, data } = rows[0];
                expect(id).to.equal(newId);
                expect(type).to.equal('form-2');
                expect(status).to.equal('draft');
                expect(data).to.equal(JSON.stringify({ value:42 }));
                done();
            });
        });
    });
});