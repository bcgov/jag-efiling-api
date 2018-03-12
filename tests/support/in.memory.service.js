var parties = {
    'appelant': {
        'name': 'Jason Dent',
        'address': 'The house of Jason, Victoria, BC'
    },
    'respondent': {
        'name': 'Bob Jones',
        'address': 'The house of Jones, Not Far, BC'
    }
};

module.exports = {
    searchForm7: function(fileNumber, callback) {
        callback(parties);
    }
};
module.exports.expected = parties;