
import * as ModelUtils from "./ModelUtils";

export default class User {

    constructor(name) {
        this.id = ModelUtils.generateId();
        this.name = name;
        this.configuration = {
            networkMode: true
        };
    }
}