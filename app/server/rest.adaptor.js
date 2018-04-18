let SearchFormSeven = require('../features/search.form.7');
let MyCases = require('../features/my.cases');
let createFormTwo = require('../features/create.form.2');
let updateFormTwo = require('../features/update.form.2');

let RestAdaptor = function() {
    this.renderSearchFormSevenResult = function(data, response) { response.write( JSON.stringify({ parties:data })); response.end(); };
    this.renderMyCasesResult = function(data, response) { response.write( JSON.stringify({ cases:data })); response.end(); };    
    this.renderCreateFormTwoResult = function(id, response) {
        response.writeHead(201, {'Location': '/forms/' + id});
        response.end();
    };
    this.renderUpdateFormTwoResult = function(id, response) {
        response.writeHead(200, {'Location': '/forms/' + id});
        response.end();
    }
};

RestAdaptor.prototype.useHub = function(hub) {
    this.searchFormSeven = new SearchFormSeven(hub);
};
RestAdaptor.prototype.useTokenValidator = function(tokenValidator) { 
    this.tokenValidator = tokenValidator; 
};
RestAdaptor.prototype.useDatabase = function(database) {
    this.myCases = new MyCases(database);     
    this.createFormTwo = new  createFormTwo(database);
    this.updateFormTwo = new updateFormTwo(database);
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
        this.createFormTwo.now(params, (data)=> {
            this.renderCreateFormTwoResult(data, response);
        });           
    });
    app.put('/api/forms/*', (request, response)=> {
        let data = JSON.parse(request.body.data);
        this.updateFormTwo.now(request.params[0], data, (data)=> {
            this.renderUpdateFormTwoResult(data, response);
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