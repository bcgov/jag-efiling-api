var request = require('request');
var {
    extractParties,
    buildPartyInfo,
    rawAppellants,
    rawRespondents,
    extractCaseType
} = require('./parsing');

function Hub(url, timeout) {
    this.url = url;
    this.timeout = timeout;
}
Hub.prototype.searchForm7 = function(file, callback) {
    var target = this.url + '/form7s?caseNumber='+file;

    request(target, {timeout: this.timeout }, function(err, response, body) {

        if (err || response.statusCode == 503) {
            callback({ error: {code:503} });
        }
        else {
            if (response.statusCode === 200) {
                var data = JSON.parse(body);
                var caseType = extractCaseType(data)
                if (caseType == 'Criminal') {
                    callback({ error: {code:404} });
                }
                else {
                    var parties = extractParties(data);
                    if (parties) {
                        callback({
                            appellants: rawAppellants(parties).map(buildPartyInfo),
                            respondents: rawRespondents(parties).map(buildPartyInfo)
                        });
                    }
                    else {
                        callback({ error: {code:404} });
                    }
                }
            }
            else {
                callback({ error: {code:404} });
            }
        }
    });
};

module.exports = Hub;
