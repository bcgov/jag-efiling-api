var expect = require('chai').expect;
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { Forms } = require('../../app/store/forms');
var CreateFormTwo = require('../../app/features/create.form.2');

describe('Create form', function() {

    var database;
    var forms;
    var createFormTwo;

    beforeEach(function(success) {        
        database = new Database();
        createFormTwo = new CreateFormTwo(database);
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
        createFormTwo.now(form, function(newId) {
            expect(newId).not.to.equal(undefined);
            forms.selectOne(newId, function(rows) {
                expect(rows.length).to.equal(1);
                var { type, status, data } = rows[0];
                expect(type).to.equal('form-2');
                expect(status).to.equal('Draft');
                expect(data).to.equal(JSON.stringify({ value:42 }));
                done();
            });
        });
    });
});
