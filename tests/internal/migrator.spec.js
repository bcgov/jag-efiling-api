var expect = require('chai').expect;
var Migrator = require('../../app/migrations/migrator');
var { Versions } = require('../../app/store/versions');

describe('Migrator', function() {

    var migrator;
    var versions;

    beforeEach(function() {
        migrator = new Migrator();
        versions = new Versions();
    });

    it('creates the record to the expected level', function(success) {
        migrator.migrateNow(function() {
            versions.selectAll(function(rows) {
                expect(rows.length).to.equal(1);
                expect(rows[0].id).to.equal(13);
                success();
            });
        });
    });
});
