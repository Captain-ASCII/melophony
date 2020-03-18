import Model from 'models/Model'

export default class Artist extends Model {

  constructor(id, name) {
    super()

    this.id = id
    this.name = name
  }

  getId() {
    return this.id
  }

  withId(id) {
    return this.with('id', id)
  }

  getName() {
    return this.name
  }

  withName(name) {
    return this.with('name', name)
  }
}