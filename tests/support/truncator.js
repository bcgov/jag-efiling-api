var pg = require('pg');
var Promise = require('yop-promises').promise;
var Promises = require('yop-promises').promises;

var Truncator = function(url) {
    this.url = url;
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
    var client = new pg.Client(this.url);    
    client.connect(function(err) {
        if (err) { throw err; }
        client.query(sql, function(err, result) {
            if (err) { throw err; }
            client.end();
            p.resolve();
        });
    });
    return p;
};

module.exports = Truncator;