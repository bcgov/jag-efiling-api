let renderSearchFormSevenResult = function(data, response) { 
    if (data == '404:NOT FOUND') {
        response.statusCode = 404;
        response.write('NOT FOUND');
    } else {
        response.write( JSON.stringify({ parties:data })); 
    }        
    response.end(); 
};
let renderMyCasesResult = function(data, response) { 
    response.write( JSON.stringify({ cases:data })); 
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

module.exports = {
    renderSearchFormSevenResult:renderSearchFormSevenResult,
    renderMyCasesResult:renderMyCasesResult,
    renderCreateFormTwoResult:renderCreateFormTwoResult,
    renderUpdateFormTwoResult:renderUpdateFormTwoResult,
    renderSavePersonResult:renderSavePersonResult,
    renderPersonInfoResult:renderPersonInfoResult
};