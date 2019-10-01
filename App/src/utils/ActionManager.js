
export default class ActionManager {

    #actionListeners = null;

    constructor() {
        this.#actionListeners = {};
    }

    expose(id, component, action) {
        this.#actionListeners[id] = { component: component, action: action };
    }

    do(id, ...parameters) {
        for (let currentId in this.#actionListeners) {
            if (currentId === id) {
                this.#actionListeners[id].action.call(this.#actionListeners[id].component, ...parameters);
            }
        }
    }
}