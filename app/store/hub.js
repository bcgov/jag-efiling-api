var request = require('request');

function Hub(url) {
    this.url = url;
};
Hub.prototype.searchForm7 = function(file, callback) {
    var self = this;
    request(this.url, function(err, response, body) {
        var data = JSON.parse(body);
        var parties = self.parties(data);
        var appellant = self.appellant(parties);
        var respondent = self.respondent(parties);

        callback({
            appellant: { 
                name:self.name(appellant),
                organization:appellant['Organization'] ,
                sollicitor : {
                    name: self.name(self.lawyer(appellant)),
                    address: self.lawyerFirmAddress(appellant)
                }
            },
            respondent: { 
                name:self.name(respondent),
                organization:respondent['Organization'] ,
                sollicitor : {
                    name: self.name(self.lawyer(respondent)),
                    address: self.lawyerFirmAddress(respondent)
                }
            }
        });
    });    
};
Hub.prototype.parties = function(data) {
    return data['soap:Envelope']['soap:Body']['ViewCasePartyResponse']['ViewCasePartyResult']['Parties']['Party'];
};
Hub.prototype.appellant = function(parties) {
    var found = undefined;
    parties.forEach((party)=>{        
        if (party['PartyRole'] == 'Appellant') { found = party; }
    });
    return found;
};
Hub.prototype.respondent = function(parties) {
    var found = undefined;
    parties.forEach((party)=>{        
        if (party['PartyRole'] == 'Respondent') { found = party; }
    });
    return found;
};
Hub.prototype.name = function(dude) {
    return dude['FirstName']+' '+dude['LastName'];
};
Hub.prototype.lawyer = function(party) {
    return party['LegalRepresentation']['Lawyer']
};
Hub.prototype.lawyerFirm = function(party) {
    return this.lawyer(party)['Firm'];
};
Hub.prototype.lawyerFirmAddress = function(party) {
    var firm = this.lawyerFirm(party);

    return firm['Address1']+' '+firm['Address2']+' '+firm['City']+' '+firm['PostalCode'];
};

module.exports = Hub;