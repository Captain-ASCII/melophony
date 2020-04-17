
export default class Event<T> {

  private id: string
  private payload: T

  constructor(id: string, payload: T) {
    this.id = id
    this.payload = payload
  }

  getId(): string {
    return this.id
  }

  getPayload(): T {
    return this.payload
  }
}