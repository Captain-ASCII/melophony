
export default class ApiManager {

    #request = {};

    constructor() {
        this.#request = {};
    }

    createRequest() {
        this.#request = new ApiRequest("GET", "");
        return this.#request;
    }

    get(path) {
        this.#request = new ApiRequest("GET", path);
        this.sendRequest();
    }

    post(path, body) {
        this.#request = new ApiRequest("POST", path).withBody(body);
        this.sendRequest();
    }

    put(path, body) {
        this.#request = new ApiRequest("PUT", path).withBody(body);
        this.sendRequest();
    }

    delete(path) {
        this.#request = new ApiRequest("DELETE", path);
        this.sendRequest();
    }

    async sendRequest() {
        console.warn(`${this.#request.getBaseUrl()}/${this.#request.getPath()}`, this.#request.getParams());
        // return await (await fetch(`${this.#request.getBaseUrl()}/${this.#request.getPath()}`, this.#request.getParams())).json();
    }
}

class ApiRequest {

    #method = "";
    #baseUrl = "";
    #path = "";
    #parameters = null;
    #body = "";

    constructor(method, path) {
        this.#method = method;
        this.#baseUrl = configurationManager.get("serverAddress");
        this.#path = path;
        this.#parameters = { method: method };
        this.#body = "";
    }

    withParameter(key, value) {
        this.#parameters[key] = value;

        return this;
    }

    withBody(body) {
        if (!this.#parameters["headers"]) {
            this.#parameters["headers"] = {};
        }
        this.#parameters["headers"]["Content-Type"] = "application/json";

        this.#body = JSON.stringify(body);
        this.#parameters["body"] = this.#body;

        return this;
    }

    getBaseUrl() {
        return this.#baseUrl;
    }

    getPath() {
        return this.#path;
    }

    getParams() {
        return this.#parameters;
    }
}