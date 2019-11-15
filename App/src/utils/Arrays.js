
export default class Arrays {

    static copy(array) {
        return JSON.parse(JSON.stringify(array));
    }

    static remove(array, condition) {
        return array.filter(condition);
    }

    static add(array, element) {
        return [...array, element];
    }
}