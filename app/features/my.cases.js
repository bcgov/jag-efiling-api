let MyCases = function(database) {
    this.database = database;
};

MyCases.prototype.now = function(login, callback) {
    this.database.myCases(login, callback);
};

module.exports = MyCases;