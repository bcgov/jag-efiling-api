let { SearchFormSeven, MyCases, CreateFormTwo, SavePerson, UpdateFormTwo,
    ArchiveCases, PreviewForm2, PersonInfo, SaveCustomization, CreateJourney,
    MyJourney, UpdateJourney, SubmitForm, AccountUsers,
    ConnectPerson, SaveAuthorizations} = require('../features');
let { searchFormSevenResponse, myCasesResponse, createFormTwoResponse,
      updateFormTwoResponse, savePersonResponse, personInfoResponse,
      archiveCasesResponse, previewForm2Response, createJourneyResponse,
      myJourneyResponse, submitForm2Response, accountUsersResponse } = require('./responses');
let ifNoError = require('./errors.handling');
let pdf = require('html-pdf');
let archiver = require('archiver');

let RestAdaptor = function() {
    this.submitForm = new SubmitForm()
    this.connectPerson = new ConnectPerson()
    this.saveAuthorizations = new SaveAuthorizations()
};

RestAdaptor.prototype.useHub = function(hub) {
    this.searchFormSeven = new SearchFormSeven(hub);
    this.submitForm.useHub(hub);
    this.accountUsers = new AccountUsers(hub);
    this.connectPerson.useHub(hub);
};
RestAdaptor.prototype.useDatabase = function(database) {
    this.myCases = new MyCases(database);
    this.myJourney = new MyJourney(database);
    this.createFormTwo = new  CreateFormTwo(database);
    this.updateFormTwo = new UpdateFormTwo(database);
    this.savePerson = new SavePerson(database);
    this.archiveCases = new ArchiveCases(database);
    this.previewForm2 = new PreviewForm2(database);
    this.getPersonInfo = new PersonInfo(database);
    this.saveCustomization = new SaveCustomization(database);
    this.createJourney = new CreateJourney(database);
    this.updateJourney = new UpdateJourney(database);
    this.connectPerson.useDatabase(database);
    this.saveAuthorizations.useDatabase(database);
    this.submitForm.useDatabase(database);
};
RestAdaptor.prototype.route = function(app) {
    app.get('/api/forms', (request, response)=> {
        this.searchFormSeven.now({ file:request.query.file }, (data)=> {
            searchFormSevenResponse(data, response);
        });
    });
    app.post('/api/forms', (request, response)=> {
        let login = request.headers['smgov_userguid'];
        this.savePerson.now(login, (id)=> {
            if (id.error) {
                createFormTwoResponse(id, response);
            }
            else {
                let params = request.body;
                params.person_id = id;
                this.createFormTwo.now(params, (formId)=> {
                    if (!formId.error) {
                        let authorizations = JSON.parse(params.data).authorizations
                        if (authorizations !== undefined) {
                            this.saveAuthorizations.now(formId, authorizations, (id)=>{
                                createFormTwoResponse(id, response);
                            })
                        }
                        else {
                            createFormTwoResponse(formId, response);
                        }
                    }
                    else {
                        createFormTwoResponse(formId, response);
                    }
                });
            }
        });
    });
    app.put('/api/forms/:id', (request, response)=> {
        let data = request.body.data;
        this.updateFormTwo.now(request.params.id, data, (data)=> {
            if (!data.error) {
                let authorizations = request.body.data.authorizations
                if (authorizations !== undefined) {
                    this.saveAuthorizations.now(request.params.id, authorizations, (id)=>{
                        updateFormTwoResponse(id, response);
                    })
                }
                else {
                    updateFormTwoResponse(data, response);
                }
            }
            else {
                updateFormTwoResponse(data, response);
            }
        });
    });
    app.get('/api/cases', (request, response)=> {
        let login = request.headers['smgov_userguid'];
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
    app.post('/api/persons/customization', (request, response)=> {
        let login = request.headers['smgov_userguid'];
        let params = request.body;
        let customization = params.customization;
        this.saveCustomization.now(login, customization, (data)=>{
            personInfoResponse(data, response);
        });
    });
    app.post('/api/cases/archive', (request, response)=> {
        let ids = JSON.parse(request.body.ids);
        this.archiveCases.now(ids, (data)=> {
            archiveCasesResponse(data, response);
        });
    });
    app.post('/api/pdf', (request, response) => {
        response.writeHead(200, {'Content-type': 'application/pdf'});
        let params = request.body;
        let html = params.html;
        pdf.create(html).toStream(function(err, stream){
            stream.pipe(response);
        });
    });
    app.get('/api/forms/:id/preview', (request, response) => {
        let id = request.params.id;
        this.previewForm2.now(id, (html)=> {
            previewForm2Response(html, response);
        })
    });

    app.get('/api/zip', async (request, response)=>{
        let error;
        var self = this;
        let ids = typeof request.query.id == 'string' ? [request.query.id] : request.query.id;
        var archive = archiver('zip');
        var doItForEach = (id) => {
            var p = new Promise((resolve, reject)=>{
                self.previewForm2.now(id, (html)=> {
                    if (html.error) {
                        error = html.error;
                        reject(error);
                    }
                    else {
                        pdf.create(html).toStream(function(err, stream) {
                            const name = 'form2-' + id + '.pdf';
                            archive.append(stream, { name: name });
                            resolve();
                        });
                    }
                });
            });
            return p
        };
        try {
            for (var index=0; index<ids.length; index++) {
                var id = ids[index];
                await doItForEach(id);
            }
        }
        catch (ignored) {}
        finally {
            ifNoError({error:error}, response).then(()=> {
                archive.finalize();
                response.setHeader('Content-type', 'application/zip');
                response.attachment('forms.zip');
                archive.pipe(response);
            });
        }
    });
    app.post('/api/journey', (request, response)=> {
        let login = request.headers['smgov_userguid'];
        this.savePerson.now(login, (data)=> {
            if (data.error) {
                createJourneyResponse(data, response);
            }
            else {
                let params = request.body;
                params.userid = data;
                this.createJourney.now(params, (data)=> {
                    createJourneyResponse(data, response);

                });
            }
        });
    });
    app.put('/api/journey/:id', (request, response)=> {
        this.updateJourney.now(request.params.id, request.body, (data)=> {
            createJourneyResponse(data, response);
        });
    });
    app.get('/api/journey', (request, response)=> {
        let login = request.headers['smgov_userguid'];
        this.myJourney.now(login, (data)=> {
            myJourneyResponse(data, response);
        });
    });
    app.post('/api/forms/:id/submit', (request, response) => {
        let login = request.headers['smgov_userguid'];
        let id = request.params.id;
        this.previewForm2.now(id, (html)=> {
            console.log('preview error', html.error);
            if (html.error) {
                submitForm2Response(html, response);
            }
            else {
                pdf.create(html).toBuffer((err, pdf)=> {
                    console.log('pdf creation error', err);
                    console.log('pdf length=', pdf.length);
                    this.submitForm.now(login, id, pdf, (data)=>{
                        submitForm2Response(data, response);
                    })
                });
            }
        });
    });
    app.get('/api/persons/connected', (request, response, next)=> {
        let login = request.headers['smgov_userguid'];
        let name = request.headers['smgov_userdisplayname'];
        this.connectPerson.now(login, (data)=>{
            if (!data.error) {
                this.getPersonInfo.now(login, (user)=>{
                    personInfoResponse({
                        error: user.error,
                        login:login,
                        name:name,
                        customization:user.customization?user.customization:undefined,
                        clientId: user.clientId,
                        accountId: user.accountId
                    }, response);
                });
            }
            else {
                personInfoResponse(data, response);
            }
        })
    });
    app.get('/api/accountusers', (request, response)=> {
        let userguid = request.headers['smgov_userguid'];
        this.accountUsers.now(userguid, (data)=> {
            accountUsersResponse(data, response);
        });
    });
    app.get('/*', function (req, res) { res.send( JSON.stringify({ message: 'pong' }) ); });
};


module.exports = RestAdaptor;
