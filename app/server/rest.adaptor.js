var url = require('url');
var SearchFormSeven = require('../features/search.form.7');
var MyCases = require('../features/my.cases');

var RestAdaptor = function() {
    this.renderSearchFormSevenResult = function(data, response) { response.write( JSON.stringify({ parties:data })); response.end(); };
    this.renderMyCasesResult = function(data, response) { response.write( JSON.stringify({ cases:data })); response.end(); };    
};

RestAdaptor.prototype.useHub = function(hub) {
    this.searchFormSeven = new SearchFormSeven(hub);
};
RestAdaptor.prototype.useTokenValidator = function(tokenValidator) { 
    this.tokenValidator = tokenValidator; 
};
RestAdaptor.prototype.useDatabase = function(database) {
    this.myCases = new MyCases(database);     
};
RestAdaptor.prototype.connect = function(request, response) {    
    var parsed = url.parse(request.url, true);
    var params = parsed.query;  
    if ('/forms' === parsed.pathname) {
        this.tokenValidator.validate(params.token, (isValid) => {
            if (!isValid) {
                response.statusCode = 403;     
                response.end();            
            } else {
                this.searchFormSeven.now({ file:parseInt(params.file) }, (data)=> {
                    this.renderSearchFormSevenResult(data, response);
                });
            }
        });
    }
    else if ('/cases' === parsed.pathname) {
        this.tokenValidator.validate(params.token, (isValid) => {
            if (!isValid) {
                response.statusCode = 403;   
                response.end();              
            } else {
                this.myCases.now({ token:params.token }, (data)=> {                    
                    this.renderMyCasesResult(data, response);
                });
            }
        });
    }
    else {
        response.write( JSON.stringify({ message: 'pong' }) );
        response.end(); 
    }
};


module.exports = RestAdaptor;