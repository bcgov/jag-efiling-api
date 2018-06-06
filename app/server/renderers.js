let render503 = function(response) {
    response.statusCode = 503;   
    response.write(JSON.stringify({message:'service unavailable'})); 
    response.end();     
};
let render404 = function(response) {
    response.statusCode = 404;
    response.end(JSON.stringify({message:'not found'}));   
};
let ifNoError = function(data, response) {
    if (data.error || data == '503:SERVICE UNAVAILABLE') {
        render503(response);
        return { then: function() {} };
    }
    if (data == '404:NOT FOUND') {
        render404(response);
        return { then: function() {} };
    } 
    return { then: function(callback) { callback(data, response); }};
};
let renderSearchFormSevenResult = function(data, response) { 
    ifNoError(data, response).then((data, response)=>{
        response.end( JSON.stringify({ parties:data })); 
    });
};
let renderMyCasesResult = function(cases, response) { 
    ifNoError(cases, response).then((cases, response) => { 
        response.end( JSON.stringify({ cases:cases })); 
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
        response.end();
    }    
};
let renderArchiveCasesResult = function(data, response) {
    ifNoError(data, response).then((cases, response) => { 
        response.end();
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