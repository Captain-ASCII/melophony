
import Event from '@models/Event'

export default class EventListener<T> {

  private id: string
  private callback: (event: Event<T>) => void

  constructor(id: string, callback: (event: Event<T>) => void) {
    this.id = id
    this.callback = callback
  }

  getId(): string {
    return this.id
  }

  getCallback(): (event: Event<T>) => void {
    return this.callback
  }
}