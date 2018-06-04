var request = require('request');
var { extractParties, buildPartyInfo, rawAppellants, rawRespondents } = require('./parsing');

function Hub(url) {
    this.url = url;
};
Hub.prototype.searchForm7 = function(file, callback) {    
    var target = this.url + '/form7s?caseNumber='+file;

    request(target, {timeout: 2000}, function(err, response, body) {

        if (err) {
            callback("503:SERVICE UNAVAILABLE");
        } else if (response.statusCode === 404) {
            callback('404:NOT FOUND');
        } else if (response.statusCode === 200) {
            var data = JSON.parse(body);
            var parties = extractParties(data);
            if (parties) {
                callback({
                    appellants: rawAppellants(parties).map(buildPartyInfo),
                    respondents: rawRespondents(parties).map(buildPartyInfo)
                });
            }
            else {
                callback('404:NOT FOUND');
            }
        }
    });    
};

module.exports = Hub;