var expect = require('chai').expect;
var Migrator = require('../../app/migrations/migrator');
var { localhost } = require('../support/postgres.client.factory');
var { Versions } = require('../../app/store/versions');
var { execute } = require('../../app/store/postgresql');

describe('Migrator', function() {

    var migrator;
    var versions;

    beforeEach(function(done) {
        migrator = new Migrator(localhost);  
        versions = new Versions(localhost);
        execute.connection = localhost;
        execute('truncate table versions', [], function() { done(); });      
    });

    it('creates the record when missing', function(done) {
        migrator.migrateNow(function() {
            versions.selectAll(function(rows) {
                expect(rows.length).to.equal(1);
                expect(rows[0].id).to.equal(3);
                done();
            });
        });
    });

    it('updates the record when it exists', function(done) {
        versions.create({id:1}, function(){
            migrator.migrateNow(function() {
                versions.selectAll(function(rows) {
                    expect(rows.length).to.equal(1);
                    expect(rows[0].id).to.equal(3);
                    done();
                });
            });
        });
    });
});