var request = require('request');
var { extractParties, buildPartyInfo, rawAppellant, rawRespondent } = require('./parsing');

function Hub(url) {
    this.url = url;
};
Hub.prototype.searchForm7 = function(file, callback) {    
    request(this.url, function(err, response, body) {
        var data = JSON.parse(body);
        var parties = extractParties(data);

        callback({
            appellants: rawAppellant(parties).map(buildPartyInfo),
            respondents: rawRespondent(parties).map(buildPartyInfo)
        });
    });    
};

module.exports = Hub;