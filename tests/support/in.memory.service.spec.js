var expect = require('chai').expect;
var service = require('./in.memory.service.js');

describe('In memory service', function() {

    it('returns some parties', function(done) {
        service.searchForm7('any', function(parties) {            
            expect(parties).to.deep.equal(service.expected);
            done();
        });
    });
});
