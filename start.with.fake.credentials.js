let server = require('./start');

setTimeout(function() {
    console.log('stopping...');
    server.stop(()=>{
        let ip = server.ip;
        let port = server.port;
        console.log('argv', process.argv);
        let guid = process.argv[2] || 'JD'
        let name = process.argv[3] || 'Doe, John'
        console.log('using', 'guid:', guid, 'name:', name);
        server.requestheaders.push({ name:'smgov_userguid', value:guid });
        server.requestheaders.push({ name:'smgov_userdisplayname', value:name });
        server.start(port, ip, function() {
            console.log(ip + ' listening on port ' + port + ' with fake credentials');
        });
    });
}, 900);

module.exports = server;
module.exports.port = server.port;
module.exports.ip = server.ip;
