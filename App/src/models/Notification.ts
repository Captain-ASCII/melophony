
import StringUtils from '@utils/StringUtils'

export default class Notification {

  private id: string
  private message: string

  public constructor(message: string) {
    this.id = StringUtils.generateId()
    this.message = message
  }

  public getId(): string {
    return this.id
  }

  public getMessage(): string {
    return this.message
  }
}