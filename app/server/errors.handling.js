let send503 = function(response) {
    response.statusCode = 503;
    response.json({message:'service unavailable'});
    response.end();
};
let send404 = function(response) {
    response.statusCode = 404;
    response.json({message:'not found'});
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
