let createFormTwo = function(database) {
    this.database = database;
};

createFormTwo.prototype.now = function(params, callback) {
    this.database.createForm({ type:'form-2', data:params.data }, callback);
};

module.exports = createFormTwo;