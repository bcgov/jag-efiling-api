const myDocumentsTemplate = document.createElement('template')

myDocumentsTemplate.innerHTML = `
<style>
    .page {
        padding: 30px 10% 10px 10%;
    }
    .section {
        background-color: white;
        padding: 10px;
    }
    .title {
        font-size: 18px;
        font-weight: 600;
        color: #494949;
    }
</style>
<div class="page">
    <div class="section">
        <label class="title">My Documents</label>
    </div>
</div>
`

class MyDocuments extends YafElement {

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
