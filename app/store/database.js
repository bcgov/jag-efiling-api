let { Forms } = require('./forms');
let { Persons } = require('./persons');
let { Journey } = require('./journey');
let { Step } = require('./step');

let ifError = function(please) {
    return {
        otherwise:function(then) {
            return (rows, error)=> {
                if (error) {
                    please.notify({ error: {code:503} });
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
    this.journeys = new Journey();
    this.steps = new Step();
};

Database.prototype.createJourney = function(journey, callback) {
    this.journeys.create(journey, ifError({notify:callback}).otherwise((rows)=> {
        callback(rows[0].last_value);
    }));
};

Database.prototype.updateJourney = function(journey, callback) {
    if (journey.id) {
        this.journeys.update(journey, ifError({notify:callback}).otherwise((rows)=> {
            callback(rows[0].last_value);
        }));
    } else {
        this.journeys.create(journey, ifError({notify: callback}).otherwise((rows) => {
            callback(rows[0].last_value);
        }));
    }
};

Database.prototype.journey = function(journey, callback) {
    this.journeys.selectOne(id, ifError({notify:callback}).otherwise((rows)=> {
        if (rows.length === 0) {
            callback({ error: {code:404} });
        }
        else {
            callback(JSON.parse(rows[0].data));
        }
    }));
};
Database.prototype.myJourneys = function(login, callback) {
    this.journeys.selectByLogin(login, ifError({notify:callback}).otherwise((rows)=> {
        callback(rows.map(function(row) {
            return {
                id: row.id,
                userid: row.userid,
                type: row.type,
                state: row.state,
                ca_number: row.ca_number,
                steps: row.steps
            };
        }));
    }));
};

Database.prototype.createStep = function(step, callback) {
    this.steps.create(step, ifError({notify:callback}).otherwise((rows)=> {
        callback(rows[0].last_value);
    }));
};

Database.prototype.step = function(step, callback) {
    this.steps.selectOne(id, ifError({notify:callback}).otherwise((rows)=> {
        if (rows.length === 0) {
            callback({ error: {code:404} });
        }
        else {
            callback(JSON.parse(rows[0].data));
        }
    }));
};

Database.prototype.createForm = function(form, callback) {
    this.forms.create(form, ifError({notify:callback}).otherwise((rows)=> {
        callback(rows[0].last_value);
    }));
};

Database.prototype.updateForm = function(form, callback) {
    this.forms.update({
            id:form.id,
            type:form.type,
            status:'Draft',
            data:JSON.stringify(form.data)
        }, 
        ifError({notify:callback}).otherwise((rows)=>{
            callback(rows[0].last_value);
        })
    );
};

Database.prototype.myCases = function(login, callback) {
    this.forms.selectByLogin(login, ifError({notify:callback}).otherwise((rows)=> {
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
    }));
};
Database.prototype.savePerson = function(person, callback) {
    this.persons.findByLogin(person.login, ifError({notify:callback}).otherwise((rows)=> {
        if (rows.length ==0) {
            this.persons.create(person, ifError(callback).otherwise((rows)=>{ 
                callback(rows[0].last_value); 
            }));
        }
        else {
            callback(rows[0].id);
        }
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

module.exports = Database;
