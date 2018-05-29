let ArchiveCases = function(database) {
    this.database = database;
};

ArchiveCases.prototype.now = function(ids, callback) {
    this.database.archiveCases(ids, callback);
};

module.exports = ArchiveCases;