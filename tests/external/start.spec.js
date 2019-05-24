var expect = require('chai').expect;
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');

describe('start script', function() {

    var server;

    before(function(done) {
        server = require('../../start');
        setTimeout(function() {
            done();
        }, 1000);
    });
    after(function(done) {
        server.stop(done);
    });

    it('migrates database', function(done) {
        execute('select id from versions', [], function(error, rows) {
            expect(rows.length).to.equal(1);
            expect(rows[0].id).to.equal(13);
            done();
        });
    });

    it('starts http ping server', function(done) {
        var ping = {
            host: server.ip,
            port: server.port,
            path: '/ping',
            headers: {
                'SMGOV_USERGUID':'max'
            }
        };
        request(ping, (err, response, body)=> {
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal(JSON.stringify({ message:'pong' }));
            done();
        });
    });

    it('uses Hub when env variable is set', (done)=>{
        server.stop(()=>{
            process.env.HUB_URL = 'this-url';
            let name = require.resolve('../../start');
            delete require.cache[name];
            server = require('../../start');
            setTimeout(function() {
                expect(server.restAdaptor.searchFormSeven.hub.url).to.equal('this-url');
                done();
            }, 300);
        });
    });

    it('uses static values when env variable is not set', (done)=>{
        server.stop(()=>{
            let name = require.resolve('../../start');
            delete require.cache[name];
            process.env.HUB_URL = undefined;
            server = require('../../start');
            setTimeout(function() {
                expect(server.restAdaptor.searchFormSeven.hub.expected.appellant.name).to.equal('Jason Dent');
                done();
            }, 300);
        });
    });

    it('uses Hub timeout when env variable is set', (done)=>{
        server.stop(()=>{
            process.env.HUB_URL = 'this-url';
            process.env.HUB_TIMEOUT = 333;
            let name = require.resolve('../../start');
            delete require.cache[name];
            server = require('../../start');
            setTimeout(function() {
                expect(server.restAdaptor.searchFormSeven.hub.timeout).to.equal(333);
                done();
            }, 300);
        });
    });

    it('defaults Hub timeout when env variable is not set', (done)=>{
        server.stop(()=>{
            process.env.HUB_URL = 'this-url';
            process.env.HUB_TIMEOUT = undefined;
            let name = require.resolve('../../start');
            delete require.cache[name];
            server = require('../../start');
            setTimeout(function() {
                expect(server.restAdaptor.searchFormSeven.hub.timeout).to.equal(2000);
                done();
            }, 300);
        });
    });

    it('resists NaN', (done)=>{
        server.stop(()=>{
            process.env.HUB_URL = 'this-url';
            process.env.HUB_TIMEOUT = 'invalid-value';
            let name = require.resolve('../../start');
            delete require.cache[name];
            server = require('../../start');
            setTimeout(function() {
                expect(server.restAdaptor.searchFormSeven.hub.timeout).to.equal(2000);
                done();
            }, 300);
        });
    });
});
