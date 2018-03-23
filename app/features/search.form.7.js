var SearchFormSeven = function(service) {
    this.hub = service;
};

SearchFormSeven.prototype.now = function(params, callback) {
    this.hub.searchForm7(params.file, callback);
};

module.exports = SearchFormSeven;