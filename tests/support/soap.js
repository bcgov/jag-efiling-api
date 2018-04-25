var soap = require('soap');

var url = process.env.SOAP_ENDPOINT + '?wsdl';
var auth = "Basic " + new Buffer(process.env.SOAP_ENDPOINT_USER + ":" + process.env.SOAP_ENDPOINT_PWD).toString("base64");

soap.createClient(url, { wsdl_headers: {Authorization: auth} }, function(err, client) {
    console.log(err);
    if (client.wsdl) { console.log(client.wsdl.xml); }
    
    if (err == null) {
        let args = {
            strCaseNumber: '10901'
        };
        client.addHttpHeader('Authorization',auth);
        client.SearchByCaseNumber(args, function(err, result) {
            console.log(err);
            console.log(result);
        });
    }
});


