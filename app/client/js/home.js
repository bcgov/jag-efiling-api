const homeTemplate = document.createElement('template')

homeTemplate.innerHTML = `
<style>
    @import '/client/all.css';
</style>
<div class="page">
    <div class="section">
        <label class="title">Document reminders</label>
        <efiling-case-list limit="5"></efiling-case-list>

        <br/>
        <span class="navigate" id="navigate-to-my-documents">View All Documents</span>
    </div>
</div>
`

class Home extends YopElement {

    constructor() {
        super()
        this.tree.appendChild(homeTemplate.content.cloneNode(true))
        this.navigateToMyDocuments = this.tree.querySelector('#navigate-to-my-documents')
    }
    connectedCallback() {
        this.navigateToMyDocuments.addEventListener('click', ()=>{
            history.pushState({}, null, '/client/my-documents');
            events.notify('navigation')
        })
    }
    update() {

    }
}
customElements.define('efiling-home', Home)
