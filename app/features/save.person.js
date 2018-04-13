let SavePerson = function(database) {
    this.database = database;
};

SavePerson.prototype.now = function(login, callback) {
    this.database.savePerson({ login:login }, callback);
};

module.exports = SavePerson;