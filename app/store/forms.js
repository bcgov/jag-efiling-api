var { execute } = require('./postgresql');

var Forms = function(connection) {
    execute.connection = connection;
};

Forms.prototype.selectAll = function(callback) {
    execute('select id, type, status, data from forms', [], callback);
};
Forms.prototype.create = function(options, callback) {
    execute('insert into forms(type, status, data) values($1, $2, $3);', 
        [options.type, options.status, options.data], function() {
            execute('SELECT last_value FROM forms_id_seq;', [], function(rows) {
                var id = rows[0].last_value; 
                callback(parseInt(id));   
            });
        });
};

module.exports = {
    Forms:Forms
};