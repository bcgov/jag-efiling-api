var { request } = require('http');
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
    var timedout = false
    var search = request(target, {timeout: this.timeout }, function(response) {
        if (timedout) { return }

        if (response.statusCode === 503) {
            callback({ error: {code:503} });
        }
        else {
            if (response.statusCode === 200) {
                var body = ''
                response.on('data', (chunk) => {
                    body += chunk
                })
                response.on('end', () => {
                    var data = JSON.parse(body);
                    var caseType = extractCaseType(data)
                    if (caseType == 'Criminal') {
                        callback({ error: {code:404, message:'criminal'} });
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
                })
            }
            else {
                callback({ error: {code:404} });
            }
        }
    })
    search.on('error', (err)=>{
        callback({ error: {code:503} })
    })
    search.on('timeout', (err)=>{
        timedout = true
        callback({ error: {code:503} })
    })
    search.end()
};

module.exports = Hub;
