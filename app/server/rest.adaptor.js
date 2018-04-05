var url = require('url');
var SearchFormSeven = require('../features/search.form.7');

var RestAdaptor = function() {};

RestAdaptor.prototype.useHub = function(hub) {
    this.searchFormSeven = new SearchFormSeven(hub);
    this.renderSearchFormSevenResult = function(data, response) { response.write( JSON.stringify({ parties:data })); };
}
RestAdaptor.prototype.connect = function(request, response) {
    var parsed = url.parse(request.url, true);    
    if ('/forms' === parsed.pathname) {
        this.searchFormSeven.now({file:42}, (data)=> {
            this.renderSearchFormSevenResult(data, response);
        });
    }
    else {
        response.write( JSON.stringify({ message: 'pong' }) );
    }
}

module.exports = RestAdaptor;