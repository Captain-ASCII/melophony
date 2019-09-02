
import FileSystem from "fs";

const DATA_DIR = "data";

export default class JsonDatabase {

    constructor(...collections) {
        this.collections = {};

        for (let name of collections) {
            this.collections[name] = this.getCollection(name, this, JSON.parse(FileSystem.readFileSync(`${DATA_DIR}/${name}.json`, "utf8")));
        }
    }

    getCollection(name, db, data) {

        let save = function() {
            this.__db.collections[this.__name] = this;
            FileSystem.writeFile(`${DATA_DIR}/${this.__name}.json`, JSON.stringify(this), "utf8", _ => false);
        }

        Object.defineProperty(data, "__name", { value: name });
        Object.defineProperty(data, "__db", { value: db });
        Object.defineProperty(data, "_save", { value: save });
        return data;
    }

    clear(collection) {
        this.collections[collection.__name] = this.getCollection(collection.__name, this, {});
        FileSystem.writeFile(`${DATA_DIR}/${collection.__name}.json`, JSON.stringify(this.collections[collection.__name]), "utf8", _ => false);
        return this.collections[collection.__name];
    }

    get(name) {
        return this.collections[name];
    }

    save() {
        for (let i in this.collections) {
            this.collections[i]._save();
        }
    }
}