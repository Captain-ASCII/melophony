
export default class ConfigurationManager {

    #configuration = {};

    constructor() {

        let defaultConfig = {
            serverAddress: "https://melophony.ddns.net",
            networkEnabled: true,
            shuffleMode: true,
            sortType: "date",
            sortOrder: "ASC",
            displayType: "itemList"
        };

        try {
            this.#configuration = JSON.parse(localStorage.getItem("configuration")) || defaultConfig;
        } catch (ex) {
            this.#configuration = defaultConfig;
        }

        this.#save();
    }

    get(key, defaultValue) {
        return this.#configuration[key];
    }

    set(key, newValue) {
        this.#configuration[key] = newValue;
        this.#save();
    }

    #save() {
        localStorage.setItem("configuration", JSON.stringify(this.#configuration));
    }
}