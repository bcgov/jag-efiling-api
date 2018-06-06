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
    var next = { then: function(callback) { callback(); }};
    if (data.error && data.error.code === 503 || data == '503:SERVICE UNAVAILABLE') {
        send503(response);
        next = { then: function() {} };
    }
    if (data.error && data.error.code === 404 || data == '404:NOT FOUND') {
        send404(response);
        next = { then: function() {} };
    } 
    return next;
};