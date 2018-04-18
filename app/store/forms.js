let { execute } = require('yop-postgresql');

let Forms = function() {
};

Forms.prototype.selectAll = function(callback) {
    execute('select id, type, status, modified, data from forms', [], callback);
};

Forms.prototype.selectOne = function(id, callback) {
    execute('select type, status, modified, data from forms where id = $1', [id], callback);
};

Forms.prototype.create = function(options, callback) {
    execute('insert into forms(type, status, data) values($1, $2, $3);', 
        [options.type, options.status, options.data], function() {
            execute('SELECT last_value FROM forms_id_seq;', [], function(rows) {
                let id = rows[0].last_value; 
                callback(parseInt(id));   
            });
        });
};
Forms.prototype.update = function(form, callback) {
    execute('update forms set type = $1, status = $2, data = $3 where id = $4',
        [form.type, form.status, form.data, form.id], function() {
            execute('SELECT last_value FROM forms_id_seq;', [], function(rows) {
                let id = rows[0].last_value;
                callback(parseInt(id));
            });
        });
};

module.exports = {
    Forms:Forms
};