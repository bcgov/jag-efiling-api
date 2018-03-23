var fs = require('fs');
var Promise = require('yop-promises').promise;
var Promises = require('yop-promises').promises;

var Migrator = function(newConnection) {
    this.newConnection = newConnection;
};

Migrator.prototype.migrateNow = function(done) {
    var ps = new Promises();
    var self = this;
    ps.waitFor(this.run('/1.create.table.versions.sql'));
    ps.waitFor(this.run('/2.create.table.forms.sql'));    
    ps.done(function() {
        ps.waitFor(self.version(2));
        ps.done(function() {
            done();
        });
    })
};

Migrator.prototype.version = function(number) {
    var p = new Promise();
    var client = this.newConnection();
    client.connect(function(err) {
        if (err) { throw err; }
        var sql = 'select id from versions';
        client.query(sql, function(err, result) {
            if (err) { throw err; }
            if (result.rows.length == 0) {
                sql = 'insert into versions(id) values($1);';
            } else {
                sql = 'update versions set id=$1;';
            }
            client.query(sql, [number], function(err, result) {
                client.end();
                p.resolve();
            });
        });
    });
    return p;
};

Migrator.prototype.run = function(filename) {
    var p = new Promise();
    var client = this.newConnection();
    client.connect(function(err) {
        if (err) { throw err; }
        var sql = fs.readFileSync(__dirname + filename).toString();
        client.query(sql, function(err, result) {
            if (err) { throw err; }
            client.end();
            p.resolve();
        });
    });
    return p;
};

module.exports = Migrator;