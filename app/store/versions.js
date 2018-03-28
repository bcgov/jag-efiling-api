var { execute } = require('yop-postgresql');

var Versions = function() {
};

Versions.prototype.selectAll = function(callback) {
    execute('select id from versions', [], callback);
};
Versions.prototype.create = function(options, callback) {
    execute('insert into versions(id) values($1);', [options.id], callback);
};
Versions.prototype.update = function(options, callback) {
    execute('update versions set id=$1;', [options.id], callback);
};

module.exports = {
    Versions:Versions
};