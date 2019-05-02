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
    .action {
        width: 30px;
        height: 25px;
        cursor: pointer;
        padding: 10px 5px 5px 5px;
        color: rgb(0, 51, 102);
        border: 1px solid rgb(0, 51, 102);
        border-radius: 5px;
        text-align: center;
        margin-left: 5px;
    }
</style>
<div class="centered page">
    <div class="section">
        <table>
            <tr>
                <td><label class="title">My Documents</label></td>
                <td class="push-right">
                    <div class="action oi oi-data-transfer-download"></div>
                    <div class="action oi oi-box"></div>
                    <div class="action oi oi-plus"></div>
                </td>
            </tr>
        </table>
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
