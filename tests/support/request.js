const { extractBody, extractBinaryBody } = require('./extract.body')
const { request } = require('http')

const call = function(options, callback) {
    send(extractBody, options, callback)
}
const callbinary = function(options, callback) {
    send(extractBinaryBody, options, callback)
}
const send = function(bodyExtractor, options, callback) {
    var action = request(options, (response)=>{
        bodyExtractor(response, (body)=>{
            callback(null, response, body)
        })
    })
    if (options.body) {
        action.write(JSON.stringify(options.body))
    }
    action.on('error', (err)=>{
        callback(err)
    })
    action.end()
}
const localhost5000json = function(options) {
    var query = {
        method: 'GET',
        host: 'localhost',
        port: 5000,
        headers:{
            'SMGOV_USERGUID':'max',
            'SMGOV_USERDISPLAYNAME': 'Free Max',
            'content-type':'application/json'
        }
    }
    Object.keys(options).forEach((key)=>{
        query[key] = options[key];
    })
    return query
}

module.exports = {
    request:call,
    requestbinary:callbinary,
    localhost5000json:localhost5000json
}
