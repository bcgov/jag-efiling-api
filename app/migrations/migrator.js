var fs = require('fs');
var { execute } = require('yop-postgresql');

var Migrator = function() {
};

Migrator.prototype.migrateNow = function(success) {
    var calls = [
        this.file('/1.create.table.versions.sql'),
        this.file('/2.create.table.forms.sql'),
        this.file('/3.alter.table.forms.add.column.modified.sql'),
        
        'truncate table versions',
        { sql:'insert into versions(id) values($1)', params:[3] }
    ];
    execute(calls, function() {
        success();
    });
};

Migrator.prototype.file = function(filename) {
    var content = fs.readFileSync(__dirname + filename).toString();
    return content;
};

module.exports = Migrator;