let SubmitForm = function() {
};
SubmitForm.prototype.useHub = function(hub) {
    this.hub = hub;
}
SubmitForm.prototype.useDatabase = function(database) {
    this.database = database;
}

SubmitForm.prototype.now = function(login, id, pdf, callback) {
    this.database.formData(id, (data)=> {
        if (data.error) { callback(data) }
        else {
            this.hub.submitForm(login, data, pdf, (data)=>{
                if (data.error) { callback(data) }
                else {
                    this.database.submitForm(id, ()=>{
                        callback(data)
                    })
                }
            });
        }
    })
};

module.exports = SubmitForm;
