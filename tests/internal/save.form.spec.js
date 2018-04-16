var expect = require('chai').expect;
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { Forms } = require('../../app/store/forms');
var { execute } = require('yop-postgresql');
var SaveFormTwo = require('../../app/features/save.form.2');

describe('Save form', function() {

    var database;
    var forms;
    var saveForm;

    beforeEach(function(success) {
        database = new Database();
        saveForm = new SaveFormTwo(database);
        forms = new Forms();
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                success();
            });
        });
    });

    it('is linked to a person', (done)=> {
        var background = [
            'alter sequence person_id_seq restart',
            { sql:'insert into person(login) values ($1)', params:['max'] },
        ];
        execute(background, ()=>{
            var form = {
                type: 'form-2',
                data: { value:42 },
                person_id: 1
            };
            saveForm.now(form, function(newId) {
                expect(newId).not.to.equal(undefined);
                forms.selectByLogin('max', function(rows) {
                    expect(rows.length).to.equal(1);
                    var { id, type, data } = rows[0];
                    
                    expect(id).to.equal(newId);
                    expect(type).to.equal('form-2');
                    expect(data).to.equal(JSON.stringify({ value:42 }));
                    done();
                });
            });
        });
    });    

    it('defaults status to draft', (done)=> {
        var background = [
            'alter sequence person_id_seq restart',
            { sql:'insert into person(login) values ($1)', params:['max'] },
        ];
        execute(background, ()=> {
            var form = {
                type: 'form-2',
                data: { value:42 },
                person_id: 1
            };
            saveForm.now(form, function(newId) {
                expect(newId).not.to.equal(undefined);
                forms.selectByLogin('max', function(rows) {
                    expect(rows.length).to.equal(1);
                    var { status } = rows[0];
    
                    expect(status).to.equal('Draft');
                    done();
                });
            });
        });        
    });
});
