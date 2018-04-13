let UpdateFormTwo = function(database) {
    this.database = database;
};

UpdateFormTwo.prototype.now = function(params, callback) {
    this.database.updateForm({ type:'form-2', data:params.data }, callback);
};

module.exports = UpdateFormTwo;