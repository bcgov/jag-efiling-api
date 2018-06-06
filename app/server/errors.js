let render503 = function(response) {
    response.statusCode = 503;   
    response.write(JSON.stringify({message:'service unavailable'})); 
    response.end();     
};
let render404 = function(response) {
    response.statusCode = 404;
    response.end(JSON.stringify({message:'not found'}));   
};
module.exports = function(data, response) {
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