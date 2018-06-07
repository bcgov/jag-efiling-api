let UpdateFormTwo = function(database) {
    this.database = database;
};

UpdateFormTwo.prototype.now = function(id, data, callback) {
    this.database.updateForm({id: id, type:'form-2', data: data }, callback);
};

module.exports = UpdateFormTwo;