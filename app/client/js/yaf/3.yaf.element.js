class YafElement extends HTMLElement {

    constructor() {
        super();
        this.shadow = this.attachShadow({
            mode: 'open'
        });
        this.tree = document.createElement('div');        
        this.shadow.appendChild(this.tree);
    }
}
