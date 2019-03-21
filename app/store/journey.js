let { execute } = require('yop-postgresql');

let Journey = function() {
};

Journey.prototype.create = function(options, callback) {
    execute('insert into journey(userid, type, state, ca_number, steps) values($1, $2, $3, $4, $5);',
        [options.userid, options.type, options.state, options.ca_number, options.steps], ()=> {
            execute('SELECT last_value FROM journey_id_seq;', [], callback);
        });
};

Journey.prototype.update = function(options, callback) {
    execute('update journey set type = $2, state = $3, ca_number = $4, steps = $5 where id = $1;',
        [options.id, options.type, options.state, options.ca_number, options.steps], ()=> {
            execute('SELECT last_value FROM journey_id_seq;', [], callback);
    });
};

Journey.prototype.selectOne = function(id, callback) {
    execute('select * from journey where id=$1', [id], callback);
};

Journey.prototype.selectByLogin = function(login, callback) {
    const select = `
        SELECT  journey.id, 
                type, 
                state, 
                userid,
                ca_number,
                steps
        FROM journey, person
        WHERE person.login = $1
        AND journey.userid = person.id
    `;
    execute(select, [login], callback);
};

module.exports = {
    Journey:Journey
};