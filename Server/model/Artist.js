
import * as ModelUtils from "./ModelUtils";

export default class Artist {

    constructor(name) {
        this.id = ModelUtils.generateId();
        this.name = name;
    }
}