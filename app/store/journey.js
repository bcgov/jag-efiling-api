let { execute } = require('yop-postgresql');

let Journey = function() {
};

Journey.prototype.create = function(options, callback) {
    execute('insert into journey(userid, type, state, ca_number) values($1, $2, $3, $4);',
        [options.userid, options.type, options.state, options.ca_number], ()=> {
            execute('SELECT last_value FROM journey_id_seq;', [], callback);
        });
};

Journey.prototype.selectOne = function(id, callback) {
    execute('select * from journey where id=$1', [id], callback);
};

module.exports = {
    Journey:Journey
};