class IfNotEmpty extends YafElement {

    constructor () {
        super()
        this.notEmptyContent = this.innerHTML
    }
    connectedCallback() {
        events.register(this, this.getAttribute('collection'))
    }
    update(news) {
        if (news.length != 0) {
            this.tree.innerHTML = this.notEmptyContent
        }
        else {
            this.tree.innerHTML = ''
        }
    }
}
customElements.define('yop-if-not-empty', IfNotEmpty)
