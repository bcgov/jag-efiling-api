class Route extends HTMLElement {

    static get observedAttributes() {
        return ['when', 'then'];
    }
    constructor() {
        super();
        var shadow = this.attachShadow({
            mode: 'open'
        })
        this.tree = document.createElement('div')
        shadow.appendChild(this.tree)
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'when' && oldValue == null) { this.when = newValue }
        if (name === 'then' && oldValue == null) { this.then = newValue }
    }
    connectedCallback() {
        events.register(this, 'navigation')
        this.update()
    }
    update() {
        if (window.location.pathname == this.when) {
            let content = document.createElement(this.then)
            this.tree.innerHTML = content.outerHTML
        }
        else {
            this.tree.innerHTML = ''
        }
    }
}
customElements.define('efiling-route', Route)
