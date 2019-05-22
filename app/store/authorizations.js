let { execute } = require('yop-postgresql');

let Authorizations = function() {
};

Authorizations.prototype.create = function(formId, options, callback) {
    execute('insert into authorizations(form_id, client_id, is_admin) values($1, $2, $3);',
        [formId, options.clientId, options.isAdmin], callback);
};

module.exports = {
    Authorizations:Authorizations
};
