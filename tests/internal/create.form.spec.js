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

    it('creates only one form 2 per user per case', function(done) {
        const first_form = {
            type: 'form-2',
            data: { value:42, formSevenNumber: "crazy-max"},
            person_id: 1
        };
        const second_form = {
            type: 'form-2',
            status: 'Accepted',
            data: { value:1984, formSevenNumber: "crazy-max", address: "yadayada badabing"},
            person_id: 1
        };
        createFormTwo.now(first_form, function(formId) {
            expect(formId).not.to.equal(undefined);
            forms.selectByFormTypeUseridAndCaseNumber(1, 'form-2', 'crazy-max', function(rows) {
                expect(rows.length).to.equal(1);
                let { id, type, status, data } = rows[0];
                expect(id).to.equal(Number(formId));
                expect(type).to.equal('form-2');
                expect(status).to.equal('Draft');
                expect(data).to.equal(JSON.stringify({ value:42, formSevenNumber: "crazy-max"}));
                createFormTwo.now(second_form, function(id) {
                    expect(id).not.to.equal(undefined);
                    expect(id).to.equal(formId);
                    forms.selectByFormTypeUseridAndCaseNumber(1, 'form-2', 'crazy-max', function (rows) {
                        expect(rows.length).to.equal(1);
                        let {id, type, status, data} = rows[0];
                        expect(status).to.equal('Accepted');
                        expect(data).to.equal(JSON.stringify({ value:1984, formSevenNumber: "crazy-max", address: "yadayada badabing"}));
                        expect(type).to.equal('form-2');
                        done()
                    });
                });
            });
        });
    });
});
