let ifNoError = require('./errors.handling');

module.exports = {
    searchFormSevenResponse: (data, response)=> {
        ifNoError(data, response).then(()=> {
            response.end(JSON.stringify({ parties: data }));
        });
    },
    myCasesResponse: (cases, response)=> {
        ifNoError(cases, response).then(()=> {
            response.end(JSON.stringify({ cases: cases }));
        });
    },
    createFormTwoResponse: (id, response)=> {
        ifNoError(id, response).then(()=> {
            response.writeHead(201, { 'Location': '/forms/' + id });
            response.end(JSON.stringify({}));
        });
    },
    updateFormTwoResponse: (id, response)=> {
        ifNoError(id, response).then(()=> {
            response.writeHead(200, { 'Location': '/forms/' + id });
            response.end(JSON.stringify({}));
        });
    },
    savePersonResponse: (id, response)=> {
        ifNoError(id, response).then(()=> {
            response.writeHead(201, { 'Location': '/persons/' + id });
            response.end(JSON.stringify({}));
        });
    },
    personInfoResponse: (person, response)=> {
        ifNoError(person, response).then(()=> {
            response.end(JSON.stringify(person));
        });
    },
    archiveCasesResponse: (data, response)=> {
        ifNoError(data, response).then(()=> {
            response.end(JSON.stringify({}));
        });
    }
};