let server = require('./start');

setTimeout(function() {
    console.log('stopping...');
    server.stop(()=>{
        let ip = server.ip;
        let port = server.port;
        server.requestheaders.push({ name:'smgov_userguid', value:'JD' });
        server.requestheaders.push({ name:'smgov_userdisplayname', value:'Doe, John' });
        server.start(port, ip, function() {
            console.log(ip + ' listening on port ' + port + ' with fake credentials');
        });
    });
}, 300);

module.exports = server;
module.exports.port = server.port;
module.exports.ip = server.ip;
