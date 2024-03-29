
import React from 'react'

import Icon from '@components/Icon'

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

const StatusMessage = ({ message, type }: { message: Str; type: MessageType }): JSX.Element => {
  return (
    <div className={`statusMessage ${type.getClassName()}`} >
      <Icon icon={type.getIcon()} />
      <p className="message" >{ message }</p>
    </div>
  )
}

export default StatusMessage

export { MessageType }