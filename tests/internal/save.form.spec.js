var expect = require('chai').expect;
var Database = require('../../app/database');
var pg = require('pg');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');

describe('Save form', function() {

    var database;
    var connectedToLocalhost = function() {
        return new pg.Client('postgres://postgres@localhost/e-filing');
    };

    beforeEach(function(done) {
        database = new Database(connectedToLocalhost);
        var migrator = new Migrator(connectedToLocalhost);
        migrator.migrateNow(function() {
            var truncator = new Truncator(connectedToLocalhost);
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
        database.saveForm(form, function(id) {            
            expect(id).not.to.equal(undefined);
            var client = connectedToLocalhost();
            client.connect(function(err) {                
                expect(err).to.equal(null);
                var sql = 'SELECT id, type, status, data FROM forms';
                client.query(sql, function(err, result) {
                    expect(err).to.equal(null);
                    expect(result.rows.length).to.equal(1);
                    var { type, status } = result.rows[0];
                    
                    expect(type).to.equal('form-2');
                    expect(status).to.equal('draft');
                    client.end();
                    done();
                });
            });
        });
    });
});