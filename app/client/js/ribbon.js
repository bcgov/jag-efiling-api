const ribbonTemplate = document.createElement('template')

ribbonTemplate.innerHTML = `
<style>
    @import '/client/all.css';

    .ribbon {
        border-top: 2px solid #fcba19;
        background-color: #38598a;
        padding-top: 0px;
        padding-bottom: 0px;
        color: white;
    }
    ul {
        margin: 0px;
        padding: 0px;
        list-style: none;
    }
    li {
        display: inline-block;
        vertical-align: top;
    }
    .menu {
        color: white;
        font-size: 13px;
        margin-right: 25px;
        cursor: pointer;
    }
    .with-separator {
        border-left: 1px solid white;
        padding-left: 25px;
    }
</style>
<div class="centered ribbon">
    <div class="content">
        <ul>
            <li class="menu" id="menu-home">HOME</li>
            <li class="menu with-separator" id="menu-my-documents">MY DOCUMENTS</li>
            <li class="menu with-separator" id="menu-all-documents">ALL DOCUMENTS</li>
        </ul>
    </div>
</div>
`

class Ribbon extends YopElement {

    constructor() {
        super()
        this.tree.appendChild(ribbonTemplate.content.cloneNode(true))
        this.home = this.tree.querySelector('#menu-home')
        this.mydocuments = this.tree.querySelector('#menu-my-documents')
    }
    connectedCallback() {
        this.home.addEventListener('click', ()=>{
            history.pushState({}, null, '/client');
            events.notify('navigation')
        })
        this.mydocuments.addEventListener('click', ()=>{
            history.pushState({}, null, '/client/my-documents');
            events.notify('navigation')
        })
    }
}
customElements.define('efiling-ribbon', Ribbon)
