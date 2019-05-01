const myDocumentsTemplate = document.createElement('template')

myDocumentsTemplate.innerHTML = `
<style>
    @import '/client/all.css';
</style>
<div class="centered page">
    <div class="section">
        <label class="title">My Documents</label>
        <efiling-case-list></efiling-case-list>
    </div>
</div>
`

class MyDocuments extends YopElement {

    constructor() {
        super()
        this.tree.appendChild(myDocumentsTemplate.content.cloneNode(true))
    }
    connectedCallback() {

    }
    update() {

    }
}
customElements.define('efiling-my-documents', MyDocuments)
