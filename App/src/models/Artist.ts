
export default class Artist {

  private id: number
  private name: string
  private imageUrl: string
  private imageName: string

  public constructor(id: number, name: string, imageUrl: string, imageName: string) {
    this.id = id
    this.name = name
    this.imageUrl = imageUrl
    this.imageName = imageName
  }

  public clone(): Artist {
    return new Artist(this.id, this.name, this.imageUrl, this.imageName)
  }

  public static fromObject(o: any): Artist | null {
    if (o) {
      return new Artist(o.id, o.name, o.imageUrl, o.imageName)
    }
    return null
  }

  public static fromArray(artists: Array<any>): Array<Artist> {
    const result: Array<Artist> = []
    if (artists) {
      for (const a of artists) {
        result.push(Artist.fromObject(a))
      }
    }
    return result
  }

  public static default() {
    return new Artist(-1, 'Unknown', '', '')
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

  public withImageUrl(url: string): Artist {
    const clone = this.clone()
    clone.imageUrl = url
    return clone
  }

  public getId(): number {
    return this.id
  }

  public getName(): string {
    return this.name
  }

  public getImageUrl(): string {
    return this.imageUrl
  }

  public getImageName(): string {
    return this.imageName
  }
}