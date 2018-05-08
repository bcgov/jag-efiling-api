var request = require('request');
var { extractParties, buildPartyInfo, rawAppellants, rawRespondents } = require('./parsing');

function Hub(url) {
    this.url = url;
};
Hub.prototype.searchForm7 = function(file, callback) {    
    request(this.url, function(err, response, body) {
        var data = JSON.parse(body);
        var parties = extractParties(data);

        callback({
            appellants: rawAppellants(parties).map(buildPartyInfo),
            respondents: rawRespondents(parties).map(buildPartyInfo)
        });
    });    
};

module.exports = Hub;