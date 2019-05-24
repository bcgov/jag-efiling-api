var { execute } = require('yop-postgresql');
var { expect } = require('chai')

var Truncator = function() {
};

Truncator.prototype.truncateTablesNow = function(success) {
    let calls = [
        'TRUNCATE TABLE journey cascade;',
        'TRUNCATE TABLE person cascade;',
        'TRUNCATE TABLE forms;',
    ];
    execute(calls, function(error, rows) {
        expect(error).to.equal(null)
        success(error);
    });
};

module.exports = Truncator;
