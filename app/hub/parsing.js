var extractParties = function(data) {
    return data['soap:Envelope']['soap:Body']['ViewCasePartyResponse']['ViewCasePartyResult']['Parties']['Party'];
};

var buildPartyInfo = function(party) {
    return { 
        name:name(party),
        organization:party['Organization'] ,
        sollicitor : {
            name: name(lawyer(party)),
            address: lawyerFirmAddress(party)
        }
    }
};
var rawAppellants = function(parties) {
    var found = [];
    parties.forEach((party)=>{        
        if (party['PartyRole'] == 'Appellant') { found.push(party); }
    });
    return found;
};
var rawRespondents = function(parties) {
    var found = [];
    parties.forEach((party)=>{        
        if (party['PartyRole'] == 'Respondent') { found.push(party); }
    });
    return found;
};
var name = function(dude) {
    return dude['FirstName']+' '+dude['LastName'];
};
var lawyer = function(party) {
    return party['LegalRepresentation']['Lawyer']
};
var lawyerFirm = function(party) {
    return lawyer(party)['Firm'];
};
var lawyerFirmAddress = function(party) {
    var firm = lawyerFirm(party);

    return firm['Address1']+' '+firm['Address2']+' '+firm['City']+' '+firm['PostalCode'];
};

module.exports = {
    extractParties:extractParties,
    buildPartyInfo:buildPartyInfo,
    rawAppellants:rawAppellants,
    rawRespondents:rawRespondents,
    name:name,
    lawyer:lawyer,
    lawyerFirm:lawyerFirm,
    lawyerFirmAddress:lawyerFirmAddress
}