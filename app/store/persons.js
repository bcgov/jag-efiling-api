let { execute } = require('yop-postgresql');

let Persons = function() {
};

Persons.prototype.create = function(options, callback) {
    execute('insert into person(login) values($1);', 
        [options.login], ()=> {            
            execute('SELECT last_value FROM person_id_seq;', [], callback);
        });
};
Persons.prototype.findByLogin = function(login, callback) {
    execute('select id, login, customization from person where login=$1', [login], callback);
};

module.exports = {
    Persons:Persons
};