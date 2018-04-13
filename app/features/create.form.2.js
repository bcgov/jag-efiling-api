let CreateFormTwo = function(database) {
    this.database = database;
};

CreateFormTwo.prototype.now = function(params, callback) {
    params.type = 'form-2';
    params.status = 'Draft';
    this.database.createForm(params, callback);
};

module.exports = CreateFormTwo;