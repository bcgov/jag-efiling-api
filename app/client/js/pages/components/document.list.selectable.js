class CaseListSelectable extends CaseList {

    constructor() {
        super()
        this.selectHeader = document.createElement('th')
        this.selectHeader.textContent = 'Select'
        this.header = this.tree.querySelector('#case-list-header')
        this.header.insertBefore(this.selectHeader, this.header.childNodes[0])

        this.selectColumn = document.createElement('td')
        this.row = this.tree.querySelector('#case-with-id')
        this.row.insertBefore(this.selectColumn, this.row.childNodes[0])
        this.check = document.createElement('input')
        this.selectColumn.appendChild(this.check)
        this.check.type = 'checkbox'
        this.check.id = 'select-case-with-id'

        this.template = this.tree.querySelector('tr#case-with-id').outerHTML
    }
    update(collection) {
        super.update(collection)
        events.notify('case-list-cleared')
        
        var checkboxes = this.tree.querySelectorAll('input')
        for (var i=0; i<checkboxes.length; i++) {
            var checkbox = checkboxes[i]
            var caseId = checkbox.id.split('-').pop()
            checkbox.addEventListener('click', (e)=>{
                var message = checkbox.checked ? 'case-selected' : 'case-unselected'
                events.notify(message, caseId)
            })
        }
    }


}
customElements.define('efiling-case-list-selectable', CaseListSelectable)
