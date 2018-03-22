var fs = require('fs');
var Promise = require('yop-promises').promise;
var Promises = require('yop-promises').promises;

var Migrator = function(newConnection) {
    this.newConnection = newConnection;
};

Migrator.prototype.migrateNow = function(done) {
    var ps = new Promises();
    ps.waitFor(this.run('/1.create.table.versions.sql'));
    ps.waitFor(this.run('/2.create.table.forms.sql'));
    ps.done(function() {
        done();
    })
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