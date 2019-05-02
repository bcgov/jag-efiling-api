const headerTemplate = document.createElement('template')

headerTemplate.innerHTML = `
<style>
    @import '/client/css/all.css';

    .header {
        background-color: #003366;
        padding-top: 0px;
        padding-bottom: 0px;
        color: white;
    }
    .logo {
        margin-right: 25px;
    }
    .bcgov-title {
        font-size: 25px;
        margin-top: 25px;
    }
    .section-user {
        font-size: 13px;
        float: right;
        margin-top: 35px;
    }
</style>
<div class="centered header">
    <div class="content">
        <ul>
            <li class="logo">
                <a href="http://gov.bc.ca">
                    <img src='/client/images/gov3_bc_logo.png'}
                        alt="Province of British Columbia"
                        title="Province of British Columbia logo" />
                </a>
            </li>
            <li class="bcgov-title">Court of Appeal</li>
            <li class="section-user" id="greetings">Welcome</li>
        </ul>
    </div>
</div>
`

class Header extends YopElement {

    constructor() {
        super()
        this.tree.appendChild(headerTemplate.content.cloneNode(true))
        this.label = this.tree.querySelector('#greetings')
        events.register(this, 'user.info')
    }
    connectedCallback() {
        api.getUserInfo().then((info)=>{
            events.notify('user.info', info)
        })
    }
    update(user) {
        let parts = user.name.split(',')
        let username = parts.length>1? parts[1] + ' ' + parts[0] : user.name

        this.label.innerHTML = 'Welcome, ' + username
    }
}
customElements.define('efiling-header', Header)
