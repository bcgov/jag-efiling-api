let MyJourneys = function(database) {
    this.database = database;
};

MyJourneys.prototype.now = function(login, callback) {
    this.database.myJourneys(login, callback);
};

module.exports = MyJourneys;