let UpdateJourney = function(database) {
    this.database = database;
};

UpdateJourney.prototype.now = function(id, data, callback) {
    this.database.updateJourney( data, callback);
};

module.exports = UpdateJourney;