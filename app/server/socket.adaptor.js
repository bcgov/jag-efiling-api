var SaveFormTwo = require('../features/save.form.2');
var SearchFormSeven = require('../features/search.form.7');

var SocketAdaptor = function() {
};

SocketAdaptor.prototype.useService = function(service) { this.searchFormSeven = new SearchFormSeven(service); };
SocketAdaptor.prototype.useTokenValidator = function(tokenValidator) { this.tokenValidator = tokenValidator; };
SocketAdaptor.prototype.useDatabase = function(database) { this.saveFormTwo = new  SaveFormTwo(database); };

SocketAdaptor.prototype.connect = function(socket) {
    this.secure(socket, 'form-7-search', this.searchFormSeven);
    this.secure(socket, 'form-2-save', this.saveFormTwo);
};

SocketAdaptor.prototype.secure = function(socket, message, service) {
    socket.on(message, (params, callback) => {
        this.tokenValidator.validate(params.token, (isValid) => {
            if (!isValid) {
                callback(undefined);
            } else {
                service.now(params, callback);
            }
        });
    });
};

module.exports = SocketAdaptor;