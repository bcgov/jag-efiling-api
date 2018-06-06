let { Forms } = require('./forms');
let { Persons } = require('./persons');

let Database = function() {
    this.forms = new Forms();
    this.persons = new Persons();
};

Database.prototype.createForm = function(form, callback) {
    this.forms.create(form, (rows, error)=> {
        callback(rows[0].last_value);
    });
};

Database.prototype.updateForm = function(form, callback) {
    this.forms.update({
        id:form.id,
        type:form.type,
        status:'Draft',
        data:JSON.stringify(form.data)}, 
        (rows, error)=> {
            callback(rows[0].last_value);
        }
    );
};

Database.prototype.myCases = function(login, callback) {
    this.forms.selectByLogin(login, function(rows, error) {
        if (error) {
            callback({error:error});
        }   
        else {     
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
        }
    });
};
Database.prototype.savePerson = function(person, callback) {
    this.persons.findByLogin(person.login, (rows, error)=> {
        if (error) {
            callback({error:error});
        } 
        else {
            if (rows.length ==0) {
                this.persons.create(person, (rows, error)=>{
                    callback(rows[0].last_value);
                });
            }
            else {
                callback(rows[0].id);
            }
        }
    });    
};
Database.prototype.findPersonByLogin = function(login, callback) {
    this.persons.findByLogin(login, (rows, error)=> {
        callback(rows[0]);
    });
};
Database.prototype.archiveCases = function(ids, callback) {        
    this.forms.archive(ids, (rows, error)=> {
        callback(rows);
    });
};

module.exports = Database;
