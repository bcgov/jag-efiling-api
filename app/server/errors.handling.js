let send503 = function(response) {
    response.statusCode = 503;
    response.write(JSON.stringify({message:'service unavailable'}));
    response.end();
};
let send404 = function(response) {
    response.statusCode = 404;
    response.end(JSON.stringify({message:'not found'}));
};
let send500 = function(message, response) {
    response.statusCode = 500;
    response.write(message);
    response.end();
};
module.exports = function(data, response) {
    let withoutError = { then: (doThat)=> { doThat(); }};
    let errorFound = { then: (stop)=> {}};
    if (data.error) {
        console.log('ERROR:', data.error);
        if (data.error.code === 503) { send503(response); }
        if (data.error.code === 404) { send404(response); }
        if (data.error.code === 500) { send500(data.error.message, response); }
        return errorFound;
    }
    return withoutError;
};
