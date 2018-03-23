var SocketAdaptor = function() {
};

SocketAdaptor.prototype.useService = function(service) { this.service = service; };
SocketAdaptor.prototype.useTokenValidator = function(tokenValidator) { this.tokenValidator = tokenValidator; };
SocketAdaptor.prototype.useDatabase = function(database) { this.database = database; };

SocketAdaptor.prototype.connect = function(socket) {
    socket.on('form-7-search', (params, callback) => {
        this.tokenValidator.validate(params.token, (isValid) => {
            if (!isValid) {
                callback(undefined);
            } else {
                this.service.searchForm7(params.file, function(data) {
                    callback({ parties: data });
                });
            }
        });
    });
    socket.on('form-2-save', (params, callback) => {
        this.tokenValidator.validate(params.token, (isValid) => {
            if (!isValid) {
                callback(undefined);
            } else {
                this.database.saveForm({ type:'form-2', data:params.data }, function(id) {
                    callback({ status:201, id:id });
                });
            }
        });
    });
};

module.exports = SocketAdaptor;