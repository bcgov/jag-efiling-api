let fs = require('fs');

let PreviewForm2 = function(database) {
    this.database = database;
    this.template = fs.readFileSync('./app/features/templates/form2.preview.html').toString();
};

PreviewForm2.prototype.now = function(id, callback) {
    this.database.formData(id, (data)=>{
        if (data.error) { callback(data); }
        else {
            var html = this.template
                .replace('{formSevenNumber}', data.formSevenNumber)
                .replace('{appellants}', this.reduce(data.appellants))
                .replace('{appellantsLabel}', 'Appellant' + this.label(data.appellants))
                .replace('{respondents}', this.reduce(data.respondents))
                .replace('{respondentsLabel}', 'Respondent' + this.label(data.respondents))
                .replace('{selectedRespondentName}', data.respondents[data.selectedRespondentIndex].name)
                .replace('{selectedRespondentAddress1}', this.extract('addressLine1', data))
                .replace('{selectedRespondentAddress2}', this.extract('addressLine2', data))
                .replace('{selectedRespondentCity}', this.extract('city', data))
                .replace('{selectedRespondentProvince}', this.extract('province', data))
                .replace('{selectedRespondentPostalCode}', this.extract('postalCode', data))
                .replace('{selectedRespondentPhone}', data.phone)
                .replace('{selectedRespondentEmail}', data.email)
                ;
            callback(html);
        }
    })
};

PreviewForm2.prototype.reduce = function(array) {
    return array.reduce((result, item, index)=> result + (index > 0 ? ', ': '') + item.name, '');
};
PreviewForm2.prototype.label = function(array) {
    return array.length > 1 ? 's': '';
};
PreviewForm2.prototype.address = function(data) {
    return data.respondents[data.selectedRespondentIndex].address;
};
PreviewForm2.prototype.extract = function(field, data) {
    return  this.address(data) && this.address(data)[field] ? this.address(data)[field] : '';
};
module.exports = PreviewForm2;