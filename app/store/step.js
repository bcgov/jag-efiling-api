let { execute } = require('yop-postgresql');

let Step = function() {
};

Step.prototype.create = function(options, callback) {
    execute('insert into step(steptype, state, journeyid, deadline) values($1, $2, $3, $4);',
        [options.steptype, options.state, options.journeyid, options.deadline], ()=> {
            execute('SELECT last_value FROM step_id_seq;', [], callback);
        });
};

Step.prototype.selectOne = function(id, callback) {
    execute('select * from step where id=$1', [id], callback);
};

module.exports = {
    Step:Step
};