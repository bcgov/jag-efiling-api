let AccountUsers = function(service) {
    this.hub = service;
};

AccountUsers.prototype.now = function(userguid, callback) {
    this.hub.accountUsers(userguid, (data)=>{
        if (data.error) { callback(data) }
        else {
            try {
                let account = data.account
                account.accountId = parseInt(account.accountId)
                account.clientId = parseInt(account.clientId)
                let users = data.client
                if (users.length === undefined ) { users =[users] }
                for (var i=0; i<users.length; i++) {
                    let user = users[i]
                    user.clientId = parseInt(user.clientId)
                    user.isAdmin = (user.isAdmin === "true")
                    user.isActive = user.isAdmin,
                    user.isEditable = !user.isAdmin
                }
                data.client = undefined
                data.authorizations = users

                callback(data)
            }
            catch(error) {
                callback({ error:{code:500, message:error.message} })
            }
        }
    });
};

module.exports = AccountUsers;
