
import StringUtils from '@utils/StringUtils'

export default class Notification {

  private id: string
  private message: string

  constructor(message: string) {
    this.id = StringUtils.generateId()
    this.message = message
  }

  getId(): string {
    return this.id
  }

  getMessage(): string {
    return this.message
  }
}