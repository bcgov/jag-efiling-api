let ConnectPerson = function(database) {
    this.database = database;
};
ConnectPerson.prototype.useHub = function(hub) {
    this.hub = hub;
}
ConnectPerson.prototype.useDatabase = function(database) {
    this.database = database;
}

ConnectPerson.prototype.now = function(login, callback) {
    this.database.savePerson({ login:login }, (id)=>{
        this.hub.isAuthorized(login, (info)=>{
            this.database.savePersonConnectionInfo(login, info, callback)
        })
    });
};

module.exports = ConnectPerson;
