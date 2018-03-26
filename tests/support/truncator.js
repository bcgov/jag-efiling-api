var Promise = require('yop-promises').promise;
var Promises = require('yop-promises').promises;
var { execute } = require('../../app/store/postgresql');

var Truncator = function(newConnection) {
    this.newConnection = newConnection;
    execute.connection = newConnection;
};

Truncator.prototype.truncateTablesNow = function(done) {
    var ps = new Promises();
    ps.waitFor(this.run('TRUNCATE TABLE forms;'));
    ps.done(function() {
        done();
    });
};

Truncator.prototype.run = function(sql) {
    var p = new Promise();
    execute(sql, [], function() {
        p.resolve();
    });
    return p;
};

module.exports = Truncator;