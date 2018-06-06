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
    var next = { then: function(callback) { callback(); }};
    if (data.error || data == '503:SERVICE UNAVAILABLE') {
        render503(response);
        next = { then: function() {} };
    }
    if (data == '404:NOT FOUND') {
        render404(response);
        next = { then: function() {} };
    } 
    return next;
};