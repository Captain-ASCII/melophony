
export default class Artist {

  constructor(id, name) {
    this.id = id
    this.name = name
  }

  getId() {
    return this.id
  }

  getName() {
    return this.name
  }

  static fromObject(o) {
    return new Artist(o.id, o.name)
  }
}