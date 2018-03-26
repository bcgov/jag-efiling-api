var { execute } = require('./postgresql');

var Forms = function(connection) {
    execute.connection = connection;
};

Forms.prototype.selectAll = function(callback) {
    execute('select id, type, status, data from forms', [], callback);
};

module.exports = {
    Forms:Forms
};