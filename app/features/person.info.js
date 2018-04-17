let PersonInfo = function(database) {
    this.database = database;
};

PersonInfo.prototype.now = function(login, callback) {
    this.database.findPersonByLogin(login, callback);
};

module.exports = PersonInfo;