let { execute } = require('yop-postgresql');

let Authorizations = function() {
};
Authorizations.prototype.delete = function(formId, callback) {
    execute('delete from authorizations where form_id=$1', [formId], callback)
};
Authorizations.prototype.create = function(formId, options, callback) {
    execute('insert into authorizations(form_id, client_id, is_admin, is_active) values($1, $2, $3, $4);',
        [formId, options.clientId, options.isAdmin, options.isActive], callback);
};

module.exports = {
    Authorizations:Authorizations
};
