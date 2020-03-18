
export default class Model {

  static getFields(object) {
    let fields = []
    for (const key in object) {
      if (this.hasOwnProperty(key)) {
        fields.push(key)
      }
    }
    return fields
  }

  static getValues(object) {
    let values = []
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        values.push(object[key])
      }
    }
    return values
  }

  clone() {
    return Reflect.construct(Reflect.getPrototypeOf(this).constructor, Model.getValues(this))
  }

  with(property, value) {
    const copy = this.clone()
    copy[property] = value
    return copy
  }

  fromObject(o) {
    for (const key in o) {
      if (this.hasOwnProperty(key)) {
        this[key] = o[key]
      }
    }
  }
}