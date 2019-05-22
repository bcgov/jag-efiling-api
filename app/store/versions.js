let { execute } = require('yop-postgresql');

let Versions = function() {
};

Versions.prototype.selectAll = function(callback) {
    execute('select id from versions', [], callback);
};

module.exports = {
    Versions:Versions
};
