let send503 = function(response) {
    response.statusCode = 503;   
    response.write(JSON.stringify({message:'service unavailable'})); 
    response.end();     
};
let send404 = function(response) {
    response.statusCode = 404;
    response.end(JSON.stringify({message:'not found'}));   
};
module.exports = function(data, response) {
    let withoutError = { then: (doThat)=> { doThat(); }};
    let errorFound = { then: (stop)=> {}};
    if (data.error) {
        if (data.error.code === 503) { send503(response); }
        if (data.error.code === 404) { send404(response); }
        return errorFound;
    }
    return withoutError;
};