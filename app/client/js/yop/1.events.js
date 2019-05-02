class Events {
    constructor() {
        this.listeners = {}
    }
    notify(id, value) {
        var listeners = this.listeners[id]
        if (listeners !== undefined) {
            for (var i=0; i<listeners.length; i++) {
                var component = listeners[i]
                component.update(value, id)
            }
        }
    }
    register(component, id) {
        var listeners = this.listeners[id]
        if (listeners === undefined) {
            this.listeners[id] = []
        }
        this.listeners[id].push(component)
    }
}
var events = new Events()


window.onpopstate = function(event) {
  events.notify('navigation', window.location.pathname)
};
