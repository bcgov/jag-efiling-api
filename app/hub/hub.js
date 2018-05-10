var request = require('request');
var { extractParties, buildPartyInfo, rawAppellants, rawRespondents } = require('./parsing');

function Hub(url) {
    this.url = url;
};
Hub.prototype.searchForm7 = function(file, callback) {    
    var target = this.url + '/form7s?caseNumber='+file;
    request(target, function(err, response, body) {
        if (response.statusCode == 404) {
            callback('404:NOT FOUND');
        }
        else {
            var data = JSON.parse(body);
            var parties = extractParties(data);

            callback({
                appellants: rawAppellants(parties).map(buildPartyInfo),
                respondents: rawRespondents(parties).map(buildPartyInfo)
            });
        }
    });    
};

module.exports = Hub;