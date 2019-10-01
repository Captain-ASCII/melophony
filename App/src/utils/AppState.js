
export default class AppState {
    static TAG = AppState.name;

    constructor() {
        AsyncStorage.get("appState", (error, appState) => {
            this.#appState = appState;
        });
        this.#observers = new Array();
    }

    onChange(path, callback) {
        let level = this.#pathLevel(path);
        if (!this.#observers[level]) {
            this.#observers[level] = {};
        }
        if (!this.#observers[level][path]) {
            this.#observers[level][path] = new Array();
        }
        this.#observers[level][path].push(callback);
    }

    #pathLevel(path) {
        return path.toString().match(/\//g).length;
    }

    #find(path, callback, shouldCreate=false) {
        try {
            let splittedPath = path.split("/");

            splittedPath.shift();
            let keyToReplace = splittedPath.pop();

            let treeCursor = this.#appState;
            for (let part of splittedPath) {
                if (shouldCreate && !treeCursor[part]) {
                    treeCursor[part] = {};
                }
                treeCursor = treeCursor[part];
            }

            if (!keyToReplace || (shouldCreate == (treeCursor[keyToReplace] != undefined))) {
                return;
            }

            callback(treeCursor, keyToReplace);
        } catch (e) {
            LOGGER.error(TAG, "Path {0} does not exist in AppState", path, e);
        }
    }

    add(path, value) {
        this.update(path, value, true);
    }

    update(path, value, shouldCreate=false) {
        this.#find(path, (element, key) => {
            element[key] = value;
            this.#notify(path, element);
            this.#save();
        }, shouldCreate);
    }

    remove(path) {
        this.#find(path, (element, key) => {
            delete element[key];
            this.#notify(path, element);
            this.#save();
        });
    }

    #notify(path, value) {
        let pathLevel = this.#pathLevel(path);
        for (let i = pathLevel; i > 0; i--) {
            for (const [observerPath, observers] of this.#observers[i]) {
                if (path.startsWith(observerPath)) {
                    for (let observer of observers) {
                        observer(value);
                    }
                }
            }
        }
    }

    #save() {
        AsyncStorage.set("appState", this.#appState);
    }
}