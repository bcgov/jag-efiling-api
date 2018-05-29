let { SearchFormSeven, MyCases, CreateFormTwo, SavePerson, PersonInfo, UpdateFormTwo, 
      ArchiveCases } = require('../features');
let { renderSearchFormSevenResult, renderMyCasesResult, renderCreateFormTwoResult,
      renderUpdateFormTwoResult, renderSavePersonResult, renderPersonInfoResult,
      renderArchiveCasesResult } = require('./renderers');

let RestAdaptor = function() {};

RestAdaptor.prototype.useHub = function(hub) {
    this.searchFormSeven = new SearchFormSeven(hub);
};
RestAdaptor.prototype.useDatabase = function(database) {
    this.myCases = new MyCases(database);
    this.createFormTwo = new  CreateFormTwo(database);
    this.updateFormTwo = new UpdateFormTwo(database);
    this.savePerson = new SavePerson(database); 
    this.personInfo = new PersonInfo(database);
    this.archiveCases = new ArchiveCases(database);
};
RestAdaptor.prototype.route = function(app) {
    app.get('/api/forms', (request, response)=> {
        this.searchFormSeven.now({ file:request.query.file }, (data)=> {
            renderSearchFormSevenResult(data, response);
        });
    });
    app.post('/api/forms', (request, response)=> {
        let login = request.headers['x-user'];
        this.savePerson.now(login, (id)=> {
            let params = request.body;
            params.data = JSON.parse(params.data);
            params.person_id = id;
            this.createFormTwo.now(params, (data)=> {
                renderCreateFormTwoResult(data, response);
            });           
        });
    });
    app.put('/api/forms/:id', (request, response)=> {
        let data = JSON.parse(request.body.data);
        this.updateFormTwo.now(request.params.id, data, (data)=> {
            renderUpdateFormTwoResult(data, response);
        });
    });
    app.get('/api/cases', (request, response)=> {
        let login = request.headers['x-user'];
        this.myCases.now(login, (data)=> {                    
            renderMyCasesResult(data, response);
        });
    });
    app.post('/api/persons', (request, response)=> {
        let params = request.body;
        let person = params.data;
        this.savePerson.now(person, (data)=> {
            renderSavePersonResult(data, response);
        });
    });
    app.get('/api/persons/:login', (request, response, next)=> {
        let login = request.params.login;
        this.personInfo.now(login, (data)=> {
            renderPersonInfoResult(data, response);
        });
    });
    app.post('/api/cases/archive', (request, response)=> {
        let params = request.body;
        let ids = JSON.parse(params.ids);
        this.archiveCases.now(ids, ()=> {
            renderArchiveCasesResult(response);
        });
    });
    app.get('/*', function (req, res) { res.send( JSON.stringify({ message: 'pong' }) ); });
};


module.exports = RestAdaptor;