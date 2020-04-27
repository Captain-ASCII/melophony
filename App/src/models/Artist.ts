
export default class Artist {

  private id: number
  private name: string

  public constructor(id: number, name: string) {
    this.id = id
    this.name = name
  }

  public clone(): Artist {
    return new Artist(this.id, this.name)
  }

  public withId(id: number): Artist {
    const clone = this.clone()
    clone.id = id
    return clone
  }

  public withName(name: string): Artist {
    const clone = this.clone()
    clone.name = name
    return clone
  }

  public getId(): number {
    return this.id
  }

  public getName(): string {
    return this.name
  }
}