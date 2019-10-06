
export default class ActionManager {

    #actionListeners = null;

    constructor() {
        this.#actionListeners = {};
    }

    expose(id, component, action, actionId = "none") {
        this.#actionListeners[id] = { component: component, action: action, actionId: actionId };
    }

    do(id, actionId, ...parameters) {
        if (this.#actionListeners[id]) {
            if (this.#actionListeners[id]["actionId"] == "none" || actionId === this.#actionListeners[id]["actionId"]) {
                this.#actionListeners[id].action.call(this.#actionListeners[id].component, ...parameters);
            }
        }
    }
}