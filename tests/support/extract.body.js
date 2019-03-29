var extractBody = function(response, callback) {
    var body = ''
    response.on('data', (chunk) => {
        body += chunk
    })
    response.on('end', () => {
        callback(body)
    })
}
var extractBinaryBody = function(response, callback) {
    var body = []
    response.on('data', (chunk) => {
        body.push(Buffer.from(chunk, 'binary'))
    })
    response.on('end', () => {
        callback(Buffer.concat(body))
    })
}

module.exports = {
    extractBody: extractBody,
    extractBinaryBody:extractBinaryBody
}
