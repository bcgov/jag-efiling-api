let MyJourney = function(database) {
    this.database = database;
};

MyJourney.prototype.now = function(login, callback) {
    this.database.myJourney(login, callback);
};

module.exports = MyJourney;