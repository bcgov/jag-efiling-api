var expect = require('chai').expect;
var Server = require('../../app/server/server');
var Database = require('../../app/store/database');
var Migrator = require('../../app/migrations/migrator');
var Truncator = require('../support/truncator');
var { execute } = require('yop-postgresql');
var request = require('request');

describe('Customization save', function() {

    var server;
    var port = 5000;
    var ip = 'localhost';
    var home = 'http://' + ip + ':' + port;
    var database;
    var options = {
        url: home + '/api/persons/customization',
        form: { customization:JSON.stringify({ thisApp:true }) },
        headers:{
            'SMGOV_USERGUID':'max'
        }
    };

    beforeEach(function(done) {
        server = new Server();
        database = new Database();
        server.useDatabase(database);
        var migrator = new Migrator();
        migrator.migrateNow(function() {
            var truncator = new Truncator();
            truncator.truncateTablesNow(function() {
                server.start(port, ip, done);
            });
        });
    });

    afterEach(function(done) {
        server.stop(done);
    });

    it('updates the user data', (done)=> {        
        var background = [
            'alter sequence person_id_seq restart',
            { sql:'insert into person(login, customization) values ($1, $2)', params:['max', JSON.stringify({ thisApp:false })] }
        ];
        execute(background, function(rows, error) {
            request.post(options, function(err, response, body) {
                expect(response.statusCode).to.equal(200);
    
                execute('SELECT id, login, customization FROM person where id=$1', [1], function(rows) {
                    expect(rows.length).to.equal(1);
    
                    var { customization } = rows[0];
                    expect(customization).to.equal(JSON.stringify({ thisApp:true }));
                    

                    request.get({
                        url: home + '/api/persons/connected',
                        headers: {
                            'SMGOV_USERGUID': 'max',
                            'SMGOV_USERDISPLAYNAME': 'Free Max'
                        }
                    }, function(err, response, body) {
                        expect(response.statusCode).to.equal(200);
                        let person = JSON.parse(body);
                        expect(person.login).to.equal('max');
                        expect(person.name).to.equal('Free Max');
                        expect(person.customization).to.deep.equal({ thisApp:true });

                        done();
                    });
                });
            });
        });        
    });

    it('creates user if not exist', (done)=>{
        var background = [
            'alter sequence person_id_seq restart'
        ];
        execute(background, function(rows, error) {
            request.post(options, function(err, response, body) {
                expect(response.statusCode).to.equal(200);
    
                execute('SELECT id, login, customization FROM person where id=$1', [1], function(rows) {
                    expect(rows.length).to.equal(1);
    
                    var { customization } = rows[0];
                    expect(customization).to.equal(JSON.stringify({ thisApp:true }));
                    

                    request.get({
                        url: home + '/api/persons/connected',
                        headers: {
                            'SMGOV_USERGUID': 'max',
                            'SMGOV_USERDISPLAYNAME': 'Free Max'
                        }
                    }, function(err, response, body) {
                        expect(response.statusCode).to.equal(200);
                        let person = JSON.parse(body);
                        expect(person.login).to.equal('max');
                        expect(person.name).to.equal('Free Max');
                        expect(person.customization).to.deep.equal({ thisApp:true });

                        done();
                    });
                });
            });
        });  
    });
});
