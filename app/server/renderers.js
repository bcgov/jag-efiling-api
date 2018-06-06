let ifNoError = require('./errors');

module.exports = {
    renderSearchFormSevenResult: function (data, response) {
        ifNoError(data, response).then((data, response) => {
            response.end(JSON.stringify({ parties: data }));
        });
    },
    renderMyCasesResult: function (cases, response) {
        ifNoError(cases, response).then((cases, response) => {
            response.end(JSON.stringify({ cases: cases }));
        });
    },
    renderCreateFormTwoResult: function (id, response) {
        ifNoError(id, response).then((cases, response) => {
            response.writeHead(201, { 'Location': '/forms/' + id });
            response.end(JSON.stringify({}));
        });
    },
    renderUpdateFormTwoResult: function (id, response) {
        ifNoError(id, response).then((cases, response) => {
            response.writeHead(200, { 'Location': '/forms/' + id });
            response.end(JSON.stringify({}));
        });
    },
    renderSavePersonResult: function (id, response) {
        ifNoError(id, response).then((cases, response) => {
            response.writeHead(201, { 'Location': '/persons/' + id });
            response.end(JSON.stringify({}));
        });
    },
    renderPersonInfoResult: function (person, response) {
        if (person !== undefined) {
            ifNoError(person, response).then((cases, response) => {
                response.end(JSON.stringify(person));
            });
        }
        else {
            response.statusCode = 404;
            response.end(JSON.stringify({}));
        }
    },
    renderArchiveCasesResult: function (data, response) {
        ifNoError(data, response).then((cases, response) => {
            response.end(JSON.stringify({}));
        });
    }
};