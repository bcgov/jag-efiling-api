var url = require('url');
var qs = require('querystring');
var SearchFormSeven = require('../features/search.form.7');
var MyCases = require('../features/my.cases');
var SaveFormTwo = require('../features/save.form.2');

var RestAdaptor = function() {
    this.renderSearchFormSevenResult = function(data, response) { response.write( JSON.stringify({ parties:data })); response.end(); };
    this.renderMyCasesResult = function(data, response) { response.write( JSON.stringify({ cases:data })); response.end(); };    
    this.renderSaveFormTwoResult = function(id, response) { 
        response.writeHead(201, {'Location': '/forms/' + id});
        response.end();
    };
};

RestAdaptor.prototype.useHub = function(hub) {
    this.searchFormSeven = new SearchFormSeven(hub);
};
RestAdaptor.prototype.useTokenValidator = function(tokenValidator) { 
    this.tokenValidator = tokenValidator; 
};
RestAdaptor.prototype.useDatabase = function(database) {
    this.myCases = new MyCases(database);     
    this.saveFormTwo = new  SaveFormTwo(database); 
};
RestAdaptor.prototype.connect = function(request, response) {    
    var parsed = url.parse(request.url, true);
    var params = parsed.query;  
    if ('/forms' === parsed.pathname && request.method == 'GET') {
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
    else if ('/forms' === parsed.pathname && request.method == 'POST') {      
        var body = '';
        request.on('data', (data)=> {
            body += data;
        });
        request.on('end', ()=> {
            params = qs.parse(body);
            this.tokenValidator.validate(params.token, (isValid) => {
                if (!isValid) {
                    response.statusCode = 403;     
                    response.end();            
                } else {
                    params.data = JSON.parse(params.data);
                    this.saveFormTwo.now(params, (data)=> {
                        this.renderSaveFormTwoResult(data, response);
                    });   
                }
            });            
        });  
        
    }
    else if ('/cases' === parsed.pathname) {
        this.tokenValidator.validate(params.token, (isValid) => {
            if (!isValid) {
                response.statusCode = 403;   
                response.end();              
            } else {
                this.myCases.now(params, (data)=> {                    
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