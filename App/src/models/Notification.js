import StringUtils from 'utils/StringUtils'

import Model from 'models/Model'

export default class Notification extends Model {
  constructor(message) {
    super()

    this.id = StringUtils.generateId()
    this.message = message
  }

  getId() {
    return this.id
  }

  getMessage() {
    return this.message
  }
}