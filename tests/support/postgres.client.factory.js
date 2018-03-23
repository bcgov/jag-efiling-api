var pg = require('pg');

module.exports = {
    localhost: function() {
        return new pg.Client('postgres://postgres@localhost/e-filing');
    }
};