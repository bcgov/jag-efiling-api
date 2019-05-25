var extractBody = function(response, callback) {
    var body = ''
    response.on('data', (chunk) => {
        body += chunk
    })
    response.on('end', () => {
        callback(body)
    })
}

module.exports = {
    extractBody: extractBody
}
