let { Forms } = require('./forms');
let { Persons } = require('./persons');
let { Journey } = require('./journey');
let { Authorizations } = require('./authorizations');

let ifError = function(please) {
    return {
        otherwise:function(then) {
            return (rows, error)=> {
                if (error) {
                    please.notify({ error: {code:503, message:error.message} });
                }
                else {
                    then(rows);
                }
            };
        }
    };
};

let Database = function() {
    this.forms = new Forms();
    this.persons = new Persons();
    this.journey = new Journey();
    this.authorizations = new Authorizations()
};

Database.prototype.createJourney = function(journey, callback) {
    this.journey.selectByUserId(journey.userid, ifError({notify:callback}).otherwise((rows)=> {
        if (!rows || rows.length === 0) {
            this.journey.create(journey, ifError({notify:callback}).otherwise((rows)=> {
                callback(rows[0].last_value);
            }));
        } else {
            journey.id = rows[0].id;
            this.journey.update(journey, ifError({notify:callback}).otherwise((rows)=> {
                callback(rows[0].last_value);
            }));
        }
    }))
};

Database.prototype.updateJourney = function(journey, callback) {
    this.journey.update(journey, ifError({notify:callback}).otherwise((rows)=> {
        callback(rows[0].last_value);
    }));
};

Database.prototype.myJourney = function(login, callback) {
    this.journey.selectByLogin(login, ifError({notify:callback}).otherwise((rows)=> {
        if (rows.length === 0) {
            callback({ error: {code:404} });
        }
        else {
            callback(rows[0]);
        }
    }));
};

Database.prototype.createForm = function(form, callback) {
    this.forms.selectByFormTypeUseridAndCaseNumber(form.person_id, form.type, JSON.parse(form.data).formSevenNumber, (rows) => {
        if (!rows || rows.length < 1 ) {
            this.forms.create(form, ifError({notify:callback}).otherwise((rows)=> {
                callback(rows[0].last_value);
            }));
        } else {
            let existingForm = rows[0];
            this.forms.update({
                    id:existingForm.id,
                    type:existingForm.type,
                    status:form.status,
                    data:(form.data)
                },
                ifError({notify:callback}).otherwise((rows)=>{
                    callback(rows[0].last_value);
                })
            );
        }
    })

};

Database.prototype.updateForm = function(form, callback) {
    this.forms.update({
            id:form.id,
            type:form.type,
            status:'Draft',
            data:form.data
        },
        ifError({notify:callback}).otherwise((rows)=>{
            callback(rows[0].last_value);
        })
    );
};
Database.prototype.submitForm = function(id, callback) {
    this.forms.updateStatus(id, 'Submitted', ifError({notify:callback}).otherwise((rows)=>{
        callback(rows);
    }))
}

Database.prototype.myCases = function(login, callback) {
    this.forms.selectByLogin(login, ifError({notify:callback}).otherwise((rows)=> {
        callback(rows.map(function(row) {
            let modified = row.modified;
            modified = JSON.stringify(modified).toString();
            modified = modified.substring(1, modified.lastIndexOf('.'))+'Z';
            return {
                id: row.id,
                personId: row.person_id,
                type: row.type,
                status: row.status,
                modified: modified,
                data: JSON.parse(row.data)
            };
        }));
    }));
};
Database.prototype.savePerson = function(person, callback) {
    this.persons.findByLogin(person.login, ifError({notify:callback}).otherwise((rows)=> {
        if (rows.length ==0) {
            this.persons.create(person, ifError({notify:callback}).otherwise((rows)=>{
                callback(rows[0].last_value);
            }));
        }
        else {
            callback(rows[0].id);
        }
    }));
};
Database.prototype.savePersonConnectionInfo = function(login, info, callback) {
    this.persons.saveConnectionInfo(login, info.accountId, info.clientId, ifError({notify:callback}).otherwise((rows)=> {
        callback(login)
    }));
};
Database.prototype.saveCustomization = function(person, callback) {
    this.savePerson(person, ()=>{
        this.persons.saveCustomization(person, ifError({notify:callback}).otherwise((rows, error)=> {
            callback(person);
        }));
    });
};
Database.prototype.archiveCases = function(ids, callback) {
    this.forms.archive(ids, ifError({notify:callback}).otherwise((rows)=> {
        callback(rows);
    }));
};
Database.prototype.formData = function(id, callback) {
    this.forms.selectOne(id, ifError({notify:callback}).otherwise((rows)=> {
        if (rows.length === 0) {
            callback({ error: {code:404} });
        }
        else {
            callback(JSON.parse(rows[0].data));
        }
    }));
};
Database.prototype.personInfo = function(login, callback) {
    this.persons.findByLogin(login, ifError({notify:callback}).otherwise((rows)=> {
        if (rows.length ==0) {
            callback({ error: {code:404} });
        }
        else {
            let person = rows[0];
            callback({ login:person.login, name:person.name, customization:JSON.parse(person.customization) });
        }
    }));
};
Database.prototype.saveAuthorization = function(formId, authorization, callback) {
    this.authorizations.create(formId, authorization, callback)
};
Database.prototype.deleteAuthorizations = function(formId, callback) {
    this.authorizations.delete(formId, callback)
};

module.exports = Database;
