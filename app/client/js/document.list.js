const caseListTemplate = document.createElement('template')

caseListTemplate.innerHTML = `
<style>
    @import '/client/css/all.css';

    table {
        margin-top: 15px;
        width: 100%;
        border-collapse: collapse;
    }
    thead {
        border-bottom: 1px solid black;
    }
    td {
        padding: 5px 0px 5px 0px;
    }
    .date {
        text-align: right;
    }
    .empty {
        margin-top: 5px;
        font-style: italic;
    }
</style>
<div>
    <table>
        <thead>
            <tr>
                <td>File #</td>
                <td>Parties</td>
                <td>Status</td>
                <td class="date">Recently Modified</td>
            </tr>
        </thead>
        <tbody>
            <tr id="case-with-id">
                <td>with-id</td>
                <td>case-parties</td>
                <td>case-status</td>
                <td class="date">case-modified</td>
            </tr>
        </tbody>
    </table>

    <efiling-if-empty collection="caselist">
        <style>
            div {
                font-style: italic;
                margin-top: 15px;
            }
        </style>
        <div>No open cases found</div>
    </efiling-if-empty>
</div>
`

class CaseList extends YopElement {

    constructor() {
        super()
        this.tree.appendChild(caseListTemplate.content.cloneNode(true))
        this.list = this.tree.querySelector('tbody')
        this.template = this.tree.querySelector('tr#case-with-id').outerHTML
        this.mappings = [
            { replace: 'with-id', with: (item)=>item.id },
            { replace: 'case-status', with: (item)=>item.status },
            { replace: 'case-parties', with: (item)=>this.parties(item.data) },
            { replace: 'case-modified', with: (item)=>dateLabelFrom(item.modified) },
        ]
        this.limit = this.getAttribute('limit')
        events.register(this, 'caselist')
    }
    connectedCallback() {
        api.getCaseList().then((cases)=>{
            events.notify('caselist', cases)
        })
    }
    update(collection) {
        this.list.innerHTML = repeat(this.template, collection, this.mappings)
    }
    parties(data) {
        let appellantName = '?';
        let respondentName = '?';
        if (data.appellant) {
            appellantName = data.appellant;
        }
        if (data.appellants && data.appellants[0]) {
            appellantName = data.appellants[0].name;
        }
        if (data.respondent) {
            respondentName = data.respondent.name;
        }
        if (data.respondents && data.respondents[0]) {
            respondentName = data.respondents[0].name;
        }
        return appellantName + ' / ' + respondentName
    }

}
customElements.define('efiling-case-list', CaseList)
