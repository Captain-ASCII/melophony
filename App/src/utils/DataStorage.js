
export default class DataStorage {

    #dataTree = null;
    #observers = null;

    constructor() {
        this.#observers = new Array();
        this.#dataTree = {};
    }

    onChange(path, callback, strict = false) {
        let level = this.#pathLevel(path);
        if (!this.#observers[level]) {
            this.#observers[level] = {};
        }
        if (!this.#observers[level][path]) {
            this.#observers[level][path] = new Array();
        }
        this.#observers[level][path].push({ strict: strict, callback: callback });
    }

    getLeafs(path = "/configuration", leafs = [], cursor = this.#dataTree["configuration"]) {
        for (let field in cursor) {
            let fieldPath = `${path}/${field}`;
            if (typeof cursor[field] === "object") {
                leafs = this.getLeafs(fieldPath, leafs, cursor[field]);
            } else {
                leafs.push({ path: fieldPath, value: cursor[field] });
            }
        }
        return leafs;
    }

    #pathLevel(path) {
        return path.toString().match(/\//g).length;
    }

    #find(path, callback=false, defaultValue=false) {
        // try {
            let splittedPath = path.split("/");

            let keyToReplace = splittedPath.pop();
            splittedPath.shift();

            let treeCursor = this.#dataTree;
            for (let part of splittedPath) {
                if (!treeCursor[part]) {
                    treeCursor[part] = {};
                }
                treeCursor = treeCursor[part];
            }

            if (callback) {
                callback(treeCursor, keyToReplace, treeCursor[keyToReplace] == undefined);
            }

            if (keyToReplace) {
                return treeCursor[keyToReplace] || defaultValue;
            }
            return treeCursor;
        // } catch (e) {
        //     console.warn(AppState.name, "Path ${path} does not exist in AppState\n", {path: path}, e.message);
        // }
    }

    #notify(path, value) {
        if (path != "") {
            let pathLevel = this.#pathLevel(path);
            for (let i = pathLevel; i > 0; i--) {
                for (let observerPath in this.#observers[i]) {
                    if ((this.#observers[i][observerPath].strict && path === observerPath)
                    || path.startsWith(observerPath)) {
                        for (let observer of this.#observers[i][observerPath]) {
                            observer.callback(value);
                        }
                    }
                }
            }
        }
    }

    #save() {
        localStorage.setItem("appState", JSON.stringify(this.#dataTree));
    }

    set(path, value) {
        this.#find(path, (element, key, isAdd) => {
            element[key] = value;
            let notifyPath = isAdd ? path.substring(0, path.lastIndexOf("/")) : path;
            this.#notify(notifyPath, value);
            this.#save();
        });
    }

    remove(path) {
        this.#find(path, (element, key) => {
            delete element[key];
            this.#notify(path.substring(0, path.lastIndexOf("/")), null);
            this.#save();
        });
    }

    get(path="/", defaultValue=false) {
        return this.#find(path, false, defaultValue);
    }

    getAsArray(path = "/") {
        let result = this.get(path);
        return result ? Object.values(result) : [];
    }
}