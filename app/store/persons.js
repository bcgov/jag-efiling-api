let { execute } = require('yop-postgresql');

let Persons = function() {
};

Persons.prototype.selectAll = function(callback) {
    execute('select id, username from person', [], callback);
};
Persons.prototype.create = function(options, callback) {
    execute('insert into person(login) values($1);', 
        [options.login], function() {
            execute('SELECT last_value FROM person_id_seq;', [], function(rows) {
                let id = rows[0].last_value; 
                callback(parseInt(id));   
            });
        });
};
Persons.prototype.findByLogin = function(login, callback) {
    execute('select id, login from person where login=$1', [login], callback);
};

module.exports = {
    Persons:Persons
};