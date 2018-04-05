var url = require('url');
var SearchFormSeven = require('../features/search.form.7');

var RestAdaptor = function() {};

RestAdaptor.prototype.useHub = function(hub) {
    this.searchFormSeven = new SearchFormSeven(hub);
    this.renderSearchFormSevenResult = function(data, response) { response.write( JSON.stringify({ parties:data })); };
};
RestAdaptor.prototype.useTokenValidator = function(tokenValidator) { 
    this.tokenValidator = tokenValidator; 
};
RestAdaptor.prototype.connect = function(request, response) {    
    var parsed = url.parse(request.url, true);
    var params = parsed.query;
    if ('/forms' === parsed.pathname) {
        this.tokenValidator.validate(params.token, (isValid) => {
            if (!isValid) {
                response.statusCode = 403;                
            } else {
                this.searchFormSeven.now({ file:parseInt(params.file) }, (data)=> {
                    this.renderSearchFormSevenResult(data, response);
                });
            }
        });
    }
    else {
        response.write( JSON.stringify({ message: 'pong' }) );
    }
};


module.exports = RestAdaptor;