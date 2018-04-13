var expect = require('chai').expect;
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { Forms } = require('../../app/store/forms');

describe('Create form', function() {

    var database;
    var forms;

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

    it('defaults status to draft', function(done) {
        var form = {
            type: 'form-2',
            data: { value:42 }
        };
        database.createForm(form, function(newId) {
            expect(newId).not.to.equal(undefined);
            forms.selectAll(function(rows) {
                expect(rows.length).to.equal(1);
                var { id, type, status, data } = rows[0];
                expect(id).to.equal(newId);
                expect(type).to.equal('form-2');
                expect(status).to.equal('Draft');
                expect(data).to.equal(JSON.stringify({ value:42 }));
                done();
            });
        });
    });
});
