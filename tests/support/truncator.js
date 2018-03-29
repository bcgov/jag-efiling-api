var { Promise, Promises } = require('yop-promises');
var { execute } = require('yop-postgresql');

var Truncator = function() {
};

Truncator.prototype.truncateTablesNow = function(success) {
    var ps = new Promises();
    ps.waitFor(this.run('TRUNCATE TABLE forms;'));
    ps.done(function() {
        success();
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