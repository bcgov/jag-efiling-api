var { Promise, Promises } = require('yop-promises');
var { execute } = require('yop-postgresql');

var Truncator = function() {
};

Truncator.prototype.truncateTablesNow = function(success) {
    let calls = [ 
        'TRUNCATE TABLE forms;',
        'TRUNCATE TABLE person;'
    ];
    execute(calls, function(rows, error) {
        success(error);
    });
};

module.exports = Truncator;