let fs = require('fs');

let PreviewForm2 = function(database) {
    this.database = database;
    this.template = fs.readFileSync('./app/features/templates/form2.preview.html').toString();
};

PreviewForm2.prototype.now = function(id, callback) {
    this.database.formData(id, (data)=>{
        if (data.error) { callback(data); }
        else {
            const selected = this.filterSelected(data.respondents);
            var html = this.template
                .replace('{formSevenNumber}', data.formSevenNumber)
                .replace('{appellants}', this.reduce(data.appellants))
                .replace('{appellantsLabel}', 'Appellant' + this.label(data.appellants))
                .replace('{respondents}', this.reduce(selected))
                .replace('{respondentsLabel}', 'Respondent' + this.label(selected))
                .replace('{selectedContactName}', data.respondents[data.selectedContactIndex].name)
                .replace('{selectedContactAddress1}', this.extract('addressLine1', data))
                .replace('{selectedContactAddress2}', this.extract('addressLine2', data))
                .replace('{selectedContactCity}', this.extract('city', data))
                .replace('{selectedContactProvince}', this.extract('province', data))
                .replace('{selectedContactPostalCode}', this.extract('postalCode', data))
                .replace('{selectedContactPhone}', data.phone)
                .replace('{selectedContactEmail}', data.useServiceEmail ? data.email : '')
                ;
            if (!data.useServiceEmail) {
                html = this.removeIfBlock('useServiceEmail', html);
            } else {
                html = this.removeIfCondition('useServiceEmail', html);                
            }
            callback(html);
        }
    })
};

PreviewForm2.prototype.reduce = function(array) {
    return array.reduce((result, item, index)=> result + (index > 0 ? ', ': '') + item.name, '');
};

PreviewForm2.prototype.filterSelected = function(array) {
    return array.filter((item)=> item.selected);
};
PreviewForm2.prototype.label = function(array) {
    return array.length > 1 ? 's': '';
};
PreviewForm2.prototype.address = function(data) {
    return data.respondents[data.selectedContactIndex].address;
};
PreviewForm2.prototype.extract = function(field, data) {
    return  this.address(data) && this.address(data)[field] ? this.address(data)[field] : '';
};
PreviewForm2.prototype.removeIfBlock = function(name, html) {
    let startIndex = html.indexOf('{if ' + name + '}');
    let endIndex = html.indexOf('{endif ' + name + '}');

    return html.substring(0, startIndex).trim() + html.substring(endIndex + ('{endif ' + name + '}').length);
};
PreviewForm2.prototype.removeIfCondition = function(name, html) {
    let startIndex = html.indexOf('{if ' + name + '}');    
    let tmp = html.substring(0, startIndex).trim() + html.substring(startIndex + ('{if ' + name + '}').length);
    let endIndex = tmp.indexOf('{endif ' + name + '}');

    return tmp.substring(0, endIndex).trim() + tmp.substring(endIndex + ('{endif ' + name + '}').length);
};
module.exports = PreviewForm2;