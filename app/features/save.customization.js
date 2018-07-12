let SaveCustomization = function(database) {
    this.database = database;
};

SaveCustomization.prototype.now = function(login, customization, callback) {
    this.database.saveCustomization({ login:login, customization:customization }, callback);
};

module.exports = SaveCustomization;