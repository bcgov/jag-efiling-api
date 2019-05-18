let AccountUsers = function(service) {
    this.hub = service;
};

AccountUsers.prototype.now = function(userguid, callback) {
    this.hub.accountUsers(userguid, callback);
};

module.exports = AccountUsers;
