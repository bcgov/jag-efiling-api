class IfEmpty extends YafElement {
    constructor () {
        super()
        this.emptyContent = this.innerHTML
    }
    connectedCallback() {
        events.register(this, this.getAttribute('collection'))
    }
    update(news) {
        if (news.length == 0) {
            this.tree.innerHTML = this.emptyContent
        }
        else {
            this.tree.innerHTML = ''
        }
    }
}

customElements.define('yop-if-empty', IfEmpty)
