var { request } = require('http');
var { extractBody } = require('./extract.body')
var {
    extractParties,
    buildPartyInfo,
    rawAppellants,
    rawRespondents,
    extractCaseType
} = require('./parsing');

function Hub(url, timeout) {
    this.url = url;
    this.host = this.extractHost(url)
    this.port = this.extractPort(url)
    this.timeout = timeout;
}
Hub.prototype.extractHost = function(url) {
    var value = url.substring(url.indexOf('://')+3)
    if (value.indexOf(':') != -1) {
        return value.substring(0, value.indexOf(':'))
    }
    if (value.indexOf('/') != -1) {
        return value.substring(0, value.indexOf('/'))
    }
    return value
}
Hub.prototype.extractPort = function(url) {
    var value = url.substring(url.indexOf('://')+3)
    value = value.substring(value.indexOf(':')+1)
    var port = parseInt(value)
    return isNaN(port) ? 80 : port
}
Hub.prototype.accountUsers = function(userguid, callback) {
    var info = {
        method: 'GET',
        host: this.host,
        port: this.port,
        path: '/accountUsers?userguid=' + userguid,
        timeout: this.timeout
    }
    var timedout = false
    var please = request(info, function(response) {
        if (timedout) { return }
        if (response.statusCode === 200) {
            extractBody(response, (body)=>{
                var data = JSON.parse(body);
                callback(data['soap:Envelope']['soap:Body']['ns2:getCsoClientProfilesResponse']['return'])
            })
        }
        else {
            callback({ error: {code:response.statusCode} });
        }
    });
    please.on('error', (err)=>{
        callback({ error: {code:503} })
    })
    please.on('timeout', (err)=>{
        timedout = true
        callback({ error: {code:503} })
    });
    please.end();
}
Hub.prototype.isAuthorized = function(guid, callback) {
    var options = {
        method: 'GET',
        host: this.host,
        port: this.port,
        path: '/isAuthorized?userguid=' + guid,
        timeout: this.timeout
    }
    var timedout = false
    var authorized = request(options, function(response) {
        if (timedout) { return }
        if (response.statusCode === 200) {
            extractBody(response, (body)=>{
                var data = JSON.parse(body);
                var info = data['soap:Envelope']['soap:Body']['ns2:isAuthorizedUserResponse']['return']
                info.clientId = parseInt(info.clientId)
                info.accountId = parseInt(info.accountId)
                callback(info)
            })
        }
        else {
            callback({ error: {code:response.statusCode} });
        }
    });
    authorized.on('error', (err)=>{
        callback({ error: {code:503} })
    })
    authorized.on('timeout', (err)=>{
        timedout = true
        callback({ error: {code:503} })
    });
    authorized.end();
};
Hub.prototype.submitForm = function(login, pdf, callback) {
    var options = {
        method: 'POST',
        host: this.host,
        port: this.port,
        path: '/save',
        timeout: this.timeout,
        headers: {
            'smgov_userguid': login
        }
    }
    var timedout = false
    var save = request(options, function(response) {
        if (timedout) { return }
        extractBody(response, (body)=>{
            var data = JSON.parse(body);
            if (response.statusCode === 200) {
                    callback(data)
            }
            else {
                var answer = { error: {code:response.statusCode} }
                if (data.message) {
                    answer.error.message = data.message
                }
                callback(answer);
            }
        })
    });
    save.on('error', (err)=>{
        callback({ error: {code:503} })
    })
    save.on('timeout', (err)=>{
        timedout = true
        callback({ error: {code:503} })
    });
    save.end(pdf);
}
Hub.prototype.searchForm7 = function(file, callback) {
    var options = {
        method: 'GET',
        host: this.host,
        port: this.port,
        path: '/form7s?caseNumber='+file,
        timeout: this.timeout
    }
    var timedout = false
    var search = request(options, function(response) {
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
