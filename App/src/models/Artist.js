
export default class Artist {

  constructor(id, name) {
    this.id = id
    this.name = name
  }

  static #with(a, property, value) {
    let copy = new Artist(a.id, a.name)
    copy[property] = value
    return copy
  }

  getId() {
    return this.id
  }

  withId(id) {
    return Artist.#with(this, 'id', id)
  }

  getName() {
    return this.name
  }

  withName(name) {
    return Artist.#with(this, 'name', name)
  }

  static fromObject(o) {
    return new Artist(o.id, o.name)
  }
}