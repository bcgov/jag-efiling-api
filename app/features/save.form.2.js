let SaveFormTwo = function(database) {
    this.database = database;
};

SaveFormTwo.prototype.now = function(params, callback) {
    params.type = 'form-2';
    params.status = 'Draft';
    this.database.saveForm(params, callback);
};

module.exports = SaveFormTwo;