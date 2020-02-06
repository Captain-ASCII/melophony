import StringUtils from 'utils/StringUtils'

export default class Notification {
  constructor(message) {
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