const myDocumentsTemplate = document.createElement('template')

myDocumentsTemplate.innerHTML = `
<style>
    @import '/client/css/all.css';
    @import '/client/css/open-iconic-bootstrap.css';

    table {
        width: 100%;
        border-collapse: collapse;
    }
    tr {
        vertical-align: top;
    }
    td.push-right {
        text-align: right;
    }
</style>
<div class="centered page">
    <div class="section">
        <table>
            <tr>
                <td><label class="title">My Documents</label></td>
                <td class="push-right">
                    <efiling-download></efiling-download>
                    <div class="action oi oi-box"></div>
                    <div class="action oi oi-plus"></div>
                </td>
            </tr>
        </table>
        <efiling-case-list-selectable></efiling-case-list-selectable>
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
