var expect = require('chai').expect;
var Hub = require('../../app/hub/hub');

describe('Hub unavailable', function() {

    var server;
    var brokenhub;
    var port = 8111;
    var broken = 'http://bob' + ":" + port;

    beforeEach(()=> {
        brokenhub = new Hub(broken);
    });

    it('handles internet outages gracefully', function(done) {
        brokenhub.searchForm7('this-id', (data)=> {
            expect(data).to.equal('503:SERVICE UNAVAILABLE');
            done();
        });
    });
});