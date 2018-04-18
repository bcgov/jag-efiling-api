var expect = require('chai').expect;
var Server = require('../../app/server/server');
var alwaysValid = require('../support/token.always.valid.js');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

describe('Local development', ()=>{

    var server;
    var port = 5000;
    var ip = 'localhost';
    

    beforeEach(function(done) {
        server = new Server();
        server.start(port, ip, done);
        server.useTokenValidator(alwaysValid);
    });

    afterEach(function(done) {
        server.stop(done);
    });   

    it('requires cors to be overriden', (done)=>{
        var index = `
            <html>
                <head>
                    <script>
                        var fetch = function() {
                            var xhr = new XMLHttpRequest();
                            xhr.onload = function() {
                                document.getElementById('message').innerHTML = JSON.parse(xhr.responseText).message;
                            };
                            xhr.open('GET', 'http://localhost:5000/ping');
                            xhr.send(null);
                        }
                    </script>
                </head>
                <body>
                    <label id="message">waiting...</label>
                    <button id="go" onclick="fetch();">fetch</button>
                </body>
            </html>        
        `;
        const dom = new JSDOM(index, { runScripts: 'dangerously' });
        let button = dom.window.document.getElementById('go');
        var click = dom.window.document.createEvent('Event');
        click.initEvent('click', true, true);
        button.dispatchEvent(click);
        
        setTimeout(function() {
            expect(dom.window.document.getElementById('message').innerHTML).to.equal('pong');   
            done();
        }, 200);  
    });
});