var { Forms } = require('./store/forms');

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
        callback(rows.map(function(row) { return {
            id: row.id,
            type: row.type,
            status: row.status,
            data: JSON.parse(row.data)
        }}));
    });
};

module.exports = Database;