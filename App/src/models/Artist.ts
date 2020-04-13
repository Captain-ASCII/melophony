
export default class Artist {

  private id: string
  private name: string

  constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  clone(): Artist {
    return new Artist(this.id, this.name)
  }

  withId(id: string): Artist {
    const clone = this.clone()
    clone.id = id
    return clone
  }

  withName(name: string): Artist {
    const clone = this.clone()
    clone.name = name
    return clone
  }

  getId(): string {
    return this.id
  }

  getName(): string {
    return this.name
  }
}