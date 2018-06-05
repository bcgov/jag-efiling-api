var request = require('request');
var { extractParties, buildPartyInfo, rawAppellants, rawRespondents } = require('./parsing');

function Hub(url, timeout) {
    this.url = url;
    this.timeout = timeout;
};
Hub.prototype.searchForm7 = function(file, callback) {    
    var target = this.url + '/form7s?caseNumber='+file;

    request(target, {timeout: this.timeout }, function(err, response, body) {

        if (err) {
            callback('503:SERVICE UNAVAILABLE');            
        } 
        else {
            if (response.statusCode === 200) {
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
            else {
                callback('404:NOT FOUND');
            }
        }
    });    
};

module.exports = Hub;