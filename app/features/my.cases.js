var MyCases = function(database) {
    this.database = database;
};

MyCases.prototype.now = function(params, callback) {
    this.database.myCases(params.token, callback);
};

module.exports = MyCases;