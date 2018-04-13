let { Forms } = require('./forms');
let { Persons } = require('./persons');

let Database = function() {
    this.forms = new Forms();
    this.persons = new Persons();
};

Database.prototype.createForm = function(form, callback) {
    this.forms.create(form, callback);
};

Database.prototype.updateForm = function(form, callback) {
    this.forms.update({
        id:form.id,
        type:form.type,
        status:'Draft',
        data:JSON.stringify(form.data)}, callback);
};

Database.prototype.myCases = function(token, callback) {
    this.forms.selectAll(function(rows) {
        callback(rows.map(function(row) {
            let modified = row.modified;
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
Database.prototype.savePerson = function(person, callback) {
    this.persons.findByLogin(person.login, (rows)=> {
        if (rows.length ==0) {
            this.persons.create(person, callback);
        }
        else {
            let id = rows[0].id;
            callback(id);
        }
    });    
};
Database.prototype.findPersonByLogin = function(login, callback) {
    this.persons.findByLogin(login, (rows)=> {
        callback(rows[0]);
    });
}

module.exports = Database;
