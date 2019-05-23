let SubmitForm = function() {
};
SubmitForm.prototype.useHub = function(hub) {
    this.hub = hub;
}
SubmitForm.prototype.useDatabase = function(database) {
    this.database = database;
}

SubmitForm.prototype.now = function(id, pdf, callback) {
    this.hub.submitForm(pdf, (data)=>{
        if (data.error) { callback(data) }
        else {
            this.database.submitForm(id, ()=>{
                callback(data)
            })
        }
    });
};

module.exports = SubmitForm;
