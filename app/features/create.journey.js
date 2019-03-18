let CreateJourney = function(database) {
    this.database = database;
};

CreateJourney.prototype.now = function(params, callback) {
    this.database.createJourney(params, callback);
};

module.exports = CreateJourney;