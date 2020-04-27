
export default class Event<T> {

  private id: string
  private payload: T

  public constructor(id: string, payload: T) {
    this.id = id
    this.payload = payload
  }

  public getId(): string {
    return this.id
  }

  public getPayload(): T {
    return this.payload
  }
}