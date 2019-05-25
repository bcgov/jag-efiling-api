const { expect } = require('chai')
var Database = require('../../../app/store/database')
var Migrator = require('../../../app/migrations/migrator');
var Truncator = require('../../support/truncator');


describe('database person info', ()=>{


    beforeEach(function(success) {
        database = new Database();
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                success();
            });
        });
    });

    it('resists unknown user', (done)=>{
        database.personInfo('unknown', (result)=>{
            expect(result).to.deep.equal({error: { code:404 }})
            done()
        })
    })
})
