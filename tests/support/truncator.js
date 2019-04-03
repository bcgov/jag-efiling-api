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
    execute(calls, function(rows, error) {
        expect(error).to.equal(undefined)
        success(error);
    });
};

module.exports = Truncator;
