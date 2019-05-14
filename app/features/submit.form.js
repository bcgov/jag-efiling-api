let SubmitForm = function(service) {
    this.hub = service;
};

SubmitForm.prototype.now = function(pdf, callback) {
    this.hub.submitForm(pdf, callback);
};

module.exports = SubmitForm;
