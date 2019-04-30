const caseListTemplate = document.createElement('template')

caseListTemplate.innerHTML = `
<style>
    @import '/client/all.css';

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
</div>
`

class CaseList extends YafElement {

    constructor() {
        super()
        this.tree.appendChild(caseListTemplate.content.cloneNode(true))
        this.list = this.tree.querySelector('tbody')
        this.template = this.tree.querySelector('tr#case-with-id').outerHTML
        this.mappings = [
            { replace: 'with-id', with: 'id' },
            { replace: 'case-status', with: 'status' },
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
        var children = ''
        for (var index = 0; index < collection.length; index++) {
            var line = this.template.split('news').join(this.getAttribute('id-prefix'))
            for (var i = 0; i < this.mappings.length; i++) {
                var mapping = this.mappings[i]
                line = line.split(mapping.replace).join(collection[index][mapping.with])
                line = line.split('case-parties').join(this.parties(collection[index].data))
                line = line.split('case-modified').join(moment(collection[index].modified).format('YYYY-MM-DD HH:mm'))
            }
            children += line
        }
        this.list.innerHTML = children
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
