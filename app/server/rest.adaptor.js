let SearchFormSeven = require('../features/search.form.7');
let MyCases = require('../features/my.cases');
let SaveFormTwo = require('../features/save.form.2');

let RestAdaptor = function() {
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
RestAdaptor.prototype.route = function(app) {   
    app.use((request, response, next)=> {
        if(this.tokenValidator) {
            let token = request.query? 
                request.query.token : 
                request.body? request.body.token : undefined;
            this.tokenValidator.validate(token, (isValid) => {
                if (!isValid) {
                    response.statusCode = 403;     
                    response.end();            
                } else {
                    next();
                }
            });        
        }
        else {
            next();
        }
    });     

    app.get('/api/forms', (request, response)=> {
        this.searchFormSeven.now({ file:parseInt(request.query.file) }, (data)=> {
            this.renderSearchFormSevenResult(data, response);
        });
    });
    app.post('/api/forms', (request, response)=> {
        let params = request.body;
        params.data = JSON.parse(params.data);
        this.saveFormTwo.now(params, (data)=> {
            this.renderSaveFormTwoResult(data, response);
        });           
    });
    app.get('/api/cases', (request, response)=> {
        this.myCases.now(request.query, (data)=> {                    
            this.renderMyCasesResult(data, response);
        });
    });
    app.get('/*', function (req, res) { res.send( JSON.stringify({ message: 'pong' }) ); });
};


module.exports = RestAdaptor;