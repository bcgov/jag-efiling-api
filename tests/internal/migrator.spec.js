var expect = require('chai').expect;
var Database = require('../../app/database');
var pg = require('pg');
var Migrator = require('../../app/migrations/migrator');

describe('Migrator', function() {

    var database;
    var connectedToLocalhost = function() {
        return new pg.Client('postgres://postgres@localhost/e-filing');
    };
    var migrator;

    beforeEach(function() {
        database = new Database(connectedToLocalhost);
        migrator = new Migrator(connectedToLocalhost);        
    });

    it('creates the record when missing', function(done) {
        var client = connectedToLocalhost();    
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
        var client = connectedToLocalhost();    
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