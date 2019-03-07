let fs = require('fs');
let { execute } = require('yop-postgresql');

let Migrator = function() {
};

Migrator.prototype.migrateNow = function(done) {
    let calls = [
        this.file('/1.create.table.versions.sql'),
        this.file('/2.create.table.forms.sql'),
        this.file('/3.alter.table.forms.add.column.modified.sql'),
        this.file('/4.create.table.person.sql'),
        this.file('/5.alter.table.forms.add.column.person.sql'),
        this.file('/6.alter.table.persons.add.column.customization.sql'),
        this.file('/7.create.table.journey.sql'),
        this.file('/8.create.table.step.sql'),
        
        'truncate table versions',
        { sql:'insert into versions(id) values($1)', params:[8] }
    ];
    execute(calls, function(rows, error) {
        done(error);
    });
};

Migrator.prototype.file = function(filename) {
    let content = fs.readFileSync(__dirname + filename).toString();
    return content;
};

module.exports = Migrator;
