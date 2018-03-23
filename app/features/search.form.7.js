var SearchFormSeven = function(service) {
    this.service = service;
};

SearchFormSeven.prototype.now = function(params, callback) {
    this.service.searchForm7(params.file, function(data) {
        callback({ parties: data });
    });
};

module.exports = SearchFormSeven;