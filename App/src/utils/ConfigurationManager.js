
export default class ConfigurationManager {

    #configuration = {};

    constructor() {

        let defaultConfig = {
            serverAddress: "https://melophony.ddns.net",
            shuffleMode: true,
            networkEnabled: true,
            displayType: "itemList"
        };

        try {
            this.#configuration = JSON.parse(localStorage.getItem("configuration"));
        } catch (ex) {
            this.#configuration = defaultConfig;
        }

        this.#save();
    }

    get(key, defaultValue) {
        return this.#configuration[key] || defaultValue;
    }

    set(key, newValue) {
        this.#configuration[key] = newValue;
        this.#save();
    }

    #save() {
        localStorage.setItem("configuration", JSON.stringify(this.#configuration));
    }
}