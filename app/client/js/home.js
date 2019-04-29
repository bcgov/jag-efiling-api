const homeTemplate = document.createElement('template')

homeTemplate.innerHTML = `
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
    .navigate {
        display: inline-block;
        padding: 10px 12px 10px 12px;
        color: #fff;
        background-color: #38598a;
        border-color: #003366;
        border-radius: 5px;
        font-size: 14px;
        font-weight: normal;
        cursor: pointer;
    }
</style>
<div class="page">
    <div class="section">
        <label class="title">Document reminders</label>

        <br/>
        <span class="navigate" id="navigate-to-my-documents">View All Documents</span>
    </div>
</div>
`

class Home extends YafElement {

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
