var fs = require('fs');
var Promise = require('yop-promises').promise;
var Promises = require('yop-promises').promises;
var { execute } = require('../store/postgresql');

var Migrator = function(connection) {
    this.connection = connection;
    execute.connection = connection;
};

Migrator.prototype.migrateNow = function(success) {
    var ps = new Promises();
    var self = this;
    ps.done(function() {
        ps.done(function() {
            success();
        });
        ps.waitFor(self.version(3));        
        ps.waitFor(self.run('/3.alter.table.forms.add.column.modified.sql'));    
    })
    ps.waitFor(this.run('/1.create.table.versions.sql'));
    ps.waitFor(this.run('/2.create.table.forms.sql'));        
};

Migrator.prototype.version = function(number) {
    var p = new Promise();
    var { Versions } = require('../store/versions');
    var versions = new Versions(this.connection);
    versions.selectAll(function(rows) {
        if (rows.length == 0) {
            versions.create({id:number}, function() {
                p.resolve();
            });
        } else {
            versions.update({id:number}, function() {
                p.resolve();
            });
        }
    });
    return p;
};

Migrator.prototype.run = function(filename) {
    var sql = fs.readFileSync(__dirname + filename).toString();
    var p = new Promise();
    execute(sql, [], function() {
        p.resolve();
    });
    return p;
};

module.exports = Migrator;