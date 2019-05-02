const downloadTemplate = document.createElement('template')

downloadTemplate.innerHTML = `
<style>
    @import '/client/css/all.css';
    @import '/client/css/open-iconic-bootstrap.css';
</style>
<div class="action oi oi-data-transfer-download" id="download-button"></div>
`

class Download extends YopElement {

    constructor() {
        super()
        this.tree.style = 'display: inline-block'
        this.tree.appendChild(downloadTemplate.content.cloneNode(true))
        events.register(this, 'case-list-cleared')
        events.register(this, 'case-selected')
        events.register(this, 'case-unselected')
    }
    update(id, event) {
        if ('case-list-cleared' == event) {
            this.ids = []
        }
        if ('case-selected' == event) {
            this.ids.push(id)
        }
        if ('case-unselected' == event) {
            this.ids.splice(this.ids.indexOf(id), 1);
        }
    }
    connectedCallback() {
        this.tree.querySelector('#download-button').addEventListener('click', (e)=>{
            api.download(this.ids).then((data)=>{
                save('forms.zip', data)                
            })
        })
    }
}
customElements.define('efiling-download', Download)
