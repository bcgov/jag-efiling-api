let { SearchFormSeven, MyCases, CreateFormTwo, SavePerson, PersonInfo, UpdateFormTwo, 
      ArchiveCases } = require('../features');
let { searchFormSevenResponse, myCasesResponse, createFormTwoResponse,
      updateFormTwoResponse, savePersonResponse, personInfoResponse,
      archiveCasesResponse } = require('./responses');

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
            searchFormSevenResponse(data, response);
        });
    });
    app.post('/api/forms', (request, response)=> {
        let login = request.headers['x-user'];
        this.savePerson.now(login, (data)=> {
            if (data.error) {
                createFormTwoResponse(data, response);
            }
            else {
                let params = request.body;
                params.data = JSON.parse(params.data);
                params.person_id = data;
                this.createFormTwo.now(params, (data)=> {
                    createFormTwoResponse(data, response);
                });   
            }        
        });
    });
    app.put('/api/forms/:id', (request, response)=> {
        let data = JSON.parse(request.body.data);
        this.updateFormTwo.now(request.params.id, data, (data)=> {
            updateFormTwoResponse(data, response);
        });
    });
    app.get('/api/cases', (request, response)=> {
        let login = request.headers['x-user'];
        this.myCases.now(login, (data)=> {                    
            myCasesResponse(data, response);
        });
    });
    app.post('/api/persons', (request, response)=> {
        let params = request.body;
        let person = params.data;
        this.savePerson.now(person, (data)=> {
            savePersonResponse(data, response);
        });
    });
    app.get('/api/persons/:login', (request, response, next)=> {
        let login = request.params.login;
        this.personInfo.now(login, (data)=> {
            personInfoResponse(data, response);
        });
    });
    app.post('/api/cases/archive', (request, response)=> {
        let params = request.body;
        let ids = JSON.parse(params.ids);
        this.archiveCases.now(ids, (data)=> {
            archiveCasesResponse(data, response);
        });
    });
    app.post('/api/pdf', (request, response) => {
        response.writeHead(200, {'Content-type': 'application/pdf'});
        let params = request.body;
        let html = params.html;
        var pdf = require('html-pdf');
        pdf.create(html).toStream(function(err, stream){            
            stream.pipe(response);
        });
    });
    app.get('/*', function (req, res) { res.send( JSON.stringify({ message: 'pong' }) ); });
};


module.exports = RestAdaptor;