var expect = require('chai').expect;
var request = require('request');
var Server = require('../../app/server/server');
var alwaysValid = require('../support/token.always.valid.js');
const Browser = require('zombie');
var browser = new Browser();

describe('Form 7 search', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;

    beforeEach(function(done) {
        server = new Server();
        server.start(port, ip, done);
        server.useTokenValidator(alwaysValid);
        server.useService({
            searchForm7: function(fileNumber, callback) {
                callback([fileNumber]);
            }
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });    

    it('return parties', function(done) {
        request(home + '/form-7?token=any&file=42', function(err, response, body) {
            expect(response.statusCode).to.equal(200);       
            expect(JSON.parse(body)).to.deep.equal({ parties: ['42'] });     
            done();
        });
    });

    it('requires a valid token', function(done) {
        server.useTokenValidator({
            validate: function(token, callback) {
                callback(false);
            }
        });
        request(home + '/form-7?token=any&file=42', function(err, response, body) {
            expect(response.statusCode).to.equal(403);         
            done();
        });
    });

    it('authorizes cross-origin requests', function(done) {
        var sendPage = function(response) {
            response.setHeader('Content-Type', 'text/html');
            var page = '<html>' +
            '<body>'+
                '<script>' +
                    'function requestSomething() {' +
                        'var xhr = new XMLHttpRequest();' +
                        'xhr.open("GET", "http://localhost:' + port + '/form-7?token=any&file=42");' +
                        'xhr.onload = function() {' +
                            'var label = document.getElementById("message");' +
                            'label.innerHTML = xhr.responseText;' +
                        '};' +
                        'xhr.send();'+                
                    '}' +
                '</script>' +
                '<div id="message">unexpected</div>'+
                '<button id="go" onclick="javascript:requestSomething();">clik me!</button>'+
            '</body>'+
            '</html>';
            response.write(page);
        };
        origin = require('http').createServer(function(request, response) {
            sendPage(response);
            response.end();
        });        
        origin.listen(port+1, function() {            
            browser.visit('http://localhost:' + (port+1))
            .then(function() {
                return browser.click('#go');
            })
            .then(function() {
                browser.assert.text('#message', JSON.stringify({ parties: ['42'] }));
            })
            .then(done, done);
        });
    });
});
