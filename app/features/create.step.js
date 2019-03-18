let CreateStep = function(database) {
    this.database = database;
};

CreateStep.prototype.now = function(params, callback) {
    this.database.createStep(params, callback);
};

module.exports = CreateStep;