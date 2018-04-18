let CreateFormTwo = function(database) {
    this.database = database;
};

CreateFormTwo.prototype.now = function(params, callback) {
    this.database.createForm({ type:'form-2', data:params.data }, callback);
};

module.exports = CreateFormTwo;