var { Forms } = require('./forms');

var Database = function(newConnection) {
    this.newConnection = newConnection;
    this.forms = new Forms(newConnection);
};
Database.prototype.saveForm = function(form, callback) {
    this.forms.create({
        type:form.type,
        status:'draft',
        data:JSON.stringify(form.data)}, callback);
};
Database.prototype.myCases = function(token, callback) {
    this.forms.selectAll(function(rows) {
        callback(rows.map(function(row) {
            var modified = row.modified;
            modified = JSON.stringify(modified).toString();
            modified = modified.substring(1, modified.lastIndexOf('.'))+'Z';
            return {
                id: row.id,
                type: row.type,
                status: row.status,
                modified: modified,
                data: JSON.parse(row.data)
            };
        }));
    });
};

module.exports = Database;
