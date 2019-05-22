var expect = require('chai').expect;
var Hub = require('../../app/hub/hub');
var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var { request, localhost5000json } = require('../support/request');

describe('When database is not responding', function() {

    var server;
    var old;
    var unavailable = JSON.stringify({message:'service unavailable'})

    beforeEach((withSuccess)=> {
        old=process.env.PGDATABASE;
        process.env.PGDATABASE='this-database-does-not-exist';
        server = new Server();
        server.useDatabase(new Database());
        server.start(5000, 'localhost', withSuccess);
    });

    afterEach((withSuccess)=> {
        process.env.PGDATABASE=old;
        server.stop(withSuccess);
    });

    const check = (action, withSuccess)=> {
        request(action, (err, response, body)=> {
            expect(response.statusCode).to.equal(503);
            expect(body).to.equal(unavailable);
            withSuccess();
        });
    }

    it('returns 503 when accessing my cases', (withSuccess)=> {
        check(localhost5000json({
            path: '/api/cases'
        }), withSuccess)
    });

    it('returns 503 when creating a form', (withSuccess)=> {
        check(localhost5000json({
            method: 'POST',
            path: '/api/forms'
        }), withSuccess)
    });

    it('returns 503 when updating a form', (withSuccess)=> {
        check(localhost5000json({
            method: 'PUT',
            path: '/api/forms/1',
            body: { data:'any' }
        }), withSuccess)
    });

    it('returns 503 when archiving a form', (withSuccess)=> {
        check(localhost5000json({
            method: 'POST',
            path: '/api/cases/archive',
            body: { ids:JSON.stringify([2, 3]) }
        }), withSuccess)
    });

    it('returns 503 when saving new person info', (withSuccess)=> {
        check(localhost5000json({
            method: 'POST',
            path: '/api/persons',
            body: { data:'Joe' }
        }), withSuccess)
    });

    it('returns 503 when previewing a form', (withSuccess)=> {
        check(localhost5000json({
            path: '/api/forms/1/preview',
        }), withSuccess)
    });

    it('returns 503 when downloading a zip', (withSuccess)=> {
        check(localhost5000json({
            path: '/api/zip?id=666',
        }), withSuccess)
    });

    it('returns 503 when creating a journey', (withSuccess)=> {
        check(localhost5000json({
            method: 'POST',
            path: '/api/journey'
        }), withSuccess)
    });

    it('returns 503 when accessing person info', (withSuccess)=> {
        server.useService({
            isAuthorized: (login, callback)=>{
                callback({
                    clientId:1234,
                    accountId:5678
                })
            }
        })
        check(localhost5000json({
            path: '/api/persons/connected',
        }), withSuccess)
    });
});
