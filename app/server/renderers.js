let ifNoError = require('./errors');

let renderSearchFormSevenResult = function(data, response) { 
    ifNoError(data, response).then((data, response)=>{
        response.end(JSON.stringify({ parties:data})); 
    });
};
let renderMyCasesResult = function(cases, response) { 
    ifNoError(cases, response).then((cases, response) => { 
        response.end(JSON.stringify({ cases:cases })); 
    });      
};    
let renderCreateFormTwoResult = function(id, response) {
    ifNoError(id, response).then((cases, response) => { 
        response.writeHead(201, {'Location': '/forms/' + id});
        response.end(JSON.stringify({}));
    });
};
let renderUpdateFormTwoResult = function(id, response) {
    ifNoError(id, response).then((cases, response) => { 
        response.writeHead(200, {'Location': '/forms/' + id});
        response.end(JSON.stringify({}));
    });  
};
let renderSavePersonResult = function(id, response) { 
    ifNoError(id, response).then((cases, response) => { 
        response.writeHead(201, {'Location': '/persons/' + id});
        response.end(JSON.stringify({}));
    });
};
let renderPersonInfoResult = function(person, response) { 
    if (person !== undefined) {
        ifNoError(person, response).then((cases, response) => { 
            response.end(JSON.stringify(person));
        });
    } 
    else {
        response.statusCode = 404;
        response.end(JSON.stringify({}));
    }    
};
let renderArchiveCasesResult = function(data, response) {
    ifNoError(data, response).then((cases, response) => { 
        response.end(JSON.stringify({}));
    });
};

module.exports = {
    renderSearchFormSevenResult:renderSearchFormSevenResult,
    renderMyCasesResult:renderMyCasesResult,
    renderCreateFormTwoResult:renderCreateFormTwoResult,
    renderUpdateFormTwoResult:renderUpdateFormTwoResult,
    renderSavePersonResult:renderSavePersonResult,
    renderPersonInfoResult:renderPersonInfoResult,
    renderArchiveCasesResult:renderArchiveCasesResult
};