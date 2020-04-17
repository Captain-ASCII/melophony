
import React from 'react'

class MessageType {

  private className: string
  private icon: string

  constructor(className: string, icon: string) {
    this.className = className
    this.icon = icon
  }

  getClassName(): string {
    return this.className
  }

  getIcon(): string {
    return this.icon
  }

  static ERROR = new MessageType('error', 'bomb')
  static WARNING = new MessageType('warning', 'exclamation-triangle')
  static INFO = new MessageType('info', 'info')
  static SUCCESS = new MessageType('success', 'check-circle')
}

const StatusMessage = ({ message, type }: { message: string; type: MessageType }): JSX.Element => {
  return (
    <div className={`statusMessage ${type.getClassName()}`} >
      <i className={`fa fa-${type.getIcon()} icon`} />
      <p className="message" >{ message }</p>
    </div>
  )
}

export default StatusMessage

export { MessageType }