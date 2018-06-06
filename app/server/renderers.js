let renderSearchFormSevenResult = function(data, response) { 
    if (data == '404:NOT FOUND') {
        response.statusCode = 404;
        response.write(JSON.stringify({message:'not found'}));
    } 
    else if (data == '503:SERVICE UNAVAILABLE') {
        response.statusCode = 503;
        response.write(JSON.stringify({message:'service unavailable'}));
    } else {
        response.write( JSON.stringify({ parties:data })); 
    }        
    response.end(); 
};
let renderMyCasesResult = function(data, response) { 
    if (data.error) {
        response.statusCode = 503;        
    }
    else {
        response.write( JSON.stringify({ cases:data })); 
    }    
    response.end(); 
};    
let renderCreateFormTwoResult = function(id, response) {
    response.writeHead(201, {'Location': '/forms/' + id});
    response.write(JSON.stringify({}));
    response.end();
};
let renderUpdateFormTwoResult = function(id, response) {
    response.writeHead(200, {'Location': '/forms/' + id});
    response.end();
};
let renderSavePersonResult = function(id, response) { 
    response.writeHead(201, {'Location': '/persons/' + id});
    response.write(JSON.stringify({}));
    response.end();
};
let renderPersonInfoResult = function(person, response) { 
    if (person !== undefined) {
        response.write(JSON.stringify(person));
    } 
    else {
        response.statusCode = 404;
    }
    response.end();
};
let renderArchiveCasesResult = function(response) {
    response.end();
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