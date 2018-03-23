var expect = require('chai').expect;
var Migrator = require('../../app/migrations/migrator');
var { localhost } = require('../support/postgres.client.factory');

describe('Migrator', function() {

    var migrator;

    beforeEach(function() {
        migrator = new Migrator(localhost);        
    });

    it('creates the record when missing', function(done) {
        var client = localhost();    
        client.connect(function(err) {
            if (err) { throw err; }
            client.query('truncate table versions', function(err, result) {
                if (err) { throw err; }
                migrator.migrateNow(function() {
                    client.query('SELECT id FROM versions', function(err, result) {
                        expect(err).to.equal(null);
                        expect(result.rows.length).to.equal(1);
                        var { id } = result.rows[0];
                        
                        expect(id).to.equal(2);
                        client.end();
                        done();
                    });
                });
            });
        });
    });

    it('updates the record when it exists', function(done) {
        var client = localhost();    
        client.connect(function(err) {
            if (err) { throw err; }
            client.query('truncate table versions', function(err, result) {
                if (err) { throw err; }
                client.query('insert into versions(id) values(1);', function(err, result) {
                    expect(err).to.equal(null);
                    migrator.migrateNow(function() {                    
                        client.query('SELECT id FROM versions', function(err, result) {
                            expect(err).to.equal(null);
                            expect(result.rows.length).to.equal(1);
                            var { id } = result.rows[0];
                            
                            expect(id).to.equal(2);
                            client.end();
                            done();
                        });
                    });
                });                
            });
        });
    });
});