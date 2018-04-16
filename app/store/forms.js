let { execute } = require('yop-postgresql');

let Forms = function() {
};

Forms.prototype.selectByLogin = function(login, callback) {
    var select = `
        SELECT  forms.id, 
                type, 
                status, 
                modified,
                data
        FROM forms, person
        WHERE person.login = $1
        AND forms.person_id = person.id
    `;
    execute(select, [login], callback);
};
Forms.prototype.create = function(options, callback) {
    execute('insert into forms(type, status, data, person_id) values($1, $2, $3, $4);', 
        [options.type, options.status, options.data, options.person_id], function(rows, err) {
            execute('SELECT last_value FROM forms_id_seq;', [], function(rows) {
                let id = rows[0].last_value; 
                callback(parseInt(id));   
            });
        });
};

module.exports = {
    Forms:Forms
};