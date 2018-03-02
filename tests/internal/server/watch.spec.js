var chai = require('chai')
    , expect = chai.expect;
var Zombie = require("zombie");
var fs = require('fs');
var path = require('path');
var Server = require('../../../app/server/server');

describe('Modifying a file', function() {

    var port = 5000;
    var ip = 'localhost';
    var url = 'http://' + ip + ':' + port;
    var fileName;
    var filePath;
    var content = `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <script src="/socket.io/socket.io.js"></script>
        </head>
        <body>
            <div id="welcome">home</div>
            <script>
                var socket = io();
                socket.on('reload', function() {
                    document.location.reload(true);
                });
            </script>
      </body>
    </html>
    `;

    beforeEach(function(done) {
        fileName = new Date().getTime();
        filePath = path.join(__dirname, '../../../app/client/' + fileName + '.html');
        fs.writeFileSync(filePath, content);
        server = new Server();
        server.useBceidServer({ isLogin:function() { return false;}, isLogout:function() { return false;} });
        server.start(port, ip, done);
    });

    afterEach(function(done) {
        server.stop(done);
        fs.unlinkSync(filePath);
    });

    it('triggers a reload', function(done) {
        const browser = new Zombie();

        browser.visit(url + '/' + fileName + '.html')
            .then(function() {
                expect(browser.query('#welcome').innerHTML).to.equal('home');
            })
            .then(function() {
                content = content.replace('home', 'budy');
                fs.writeFileSync(filePath, content);
            })
            .then(function() {
                setTimeout(function() {
                    browser.wait(function() {
                        expect(browser.query('#welcome').innerHTML).to.equal('budy');
                        done();
                    });
                }, 200);
            });
    });
});
