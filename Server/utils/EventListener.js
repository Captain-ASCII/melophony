
class Listener {
    constructor(event, callback) {
        this.event = event;
        this.callback = callback;
    }

    notify(parameters) {
        this.callback.apply(null, parameters);
    }
}

export default class EventListener {
    constructor() {
        this.listeners = [];
    }

    on(event, listenerCallback) {
        this.listeners.push(new Listener(event, listenerCallback));
    }

    notify(event, parameters) {
        for (let listener of this.listeners) {
            if (event === listener.event) {
                listener.notify(parameters);
            }
        }
    }
}