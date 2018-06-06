let ifNoError = require('./errors.handling');

module.exports = {
    renderSearchFormSevenResult: (data, response)=> {
        ifNoError(data, response).then(()=> {
            response.end(JSON.stringify({ parties: data }));
        });
    },
    renderMyCasesResult: (cases, response)=> {
        ifNoError(cases, response).then(()=> {
            response.end(JSON.stringify({ cases: cases }));
        });
    },
    renderCreateFormTwoResult: (id, response)=> {
        ifNoError(id, response).then(()=> {
            response.writeHead(201, { 'Location': '/forms/' + id });
            response.end(JSON.stringify({}));
        });
    },
    renderUpdateFormTwoResult: (id, response)=> {
        ifNoError(id, response).then(()=> {
            response.writeHead(200, { 'Location': '/forms/' + id });
            response.end(JSON.stringify({}));
        });
    },
    renderSavePersonResult: (id, response)=> {
        ifNoError(id, response).then(()=> {
            response.writeHead(201, { 'Location': '/persons/' + id });
            response.end(JSON.stringify({}));
        });
    },
    renderPersonInfoResult: (person, response)=> {
        if (person !== undefined) {
            ifNoError(person, response).then(()=> {
                response.end(JSON.stringify(person));
            });
        }
        else {
            response.statusCode = 404;
            response.end(JSON.stringify({message:'not found'}));
        }
    },
    renderArchiveCasesResult: (data, response)=> {
        ifNoError(data, response).then(()=> {
            response.end(JSON.stringify({}));
        });
    }
};