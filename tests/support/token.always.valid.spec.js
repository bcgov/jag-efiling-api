var expect = require('chai').expect;
var validator = require('./token.always.valid.js');

describe('Always valid', function() {

    it('returns true', function(done) {
        validator.validate('any', function(isValid) {            
            expect(isValid).to.deep.equal(true);
            done();
        });
    });

    it('returns true not matter what', function(done) {
        validator.validate(undefined, function(isValid) {            
            expect(isValid).to.deep.equal(true);
            done();
        });
    });
});
