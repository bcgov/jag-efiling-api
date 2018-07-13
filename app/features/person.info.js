let PersonInfo = function(database) {
    this.database = database;
};

PersonInfo.prototype.now = function(login, callback) {
    this.database.personInfo(login, callback);
};

module.exports = PersonInfo;