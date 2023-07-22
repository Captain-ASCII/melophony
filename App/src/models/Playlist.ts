
import Track from '@models/Track'

export default class Playlist {

  private id: number
  private name: string
  private tracks: Array<Track>
  private imageUrl: string
  private imageModified: boolean
  private imageName: string

  public constructor(id: number, name: string, tracks: Array<Track>, imageUrl: string, imageName: string) {
    this.id = id
    this.name = name
    this.tracks = tracks
    this.imageUrl = imageUrl
    this.imageName = imageName
    this.imageModified = false
  }

  public static default() {
    return new Playlist(-1, '', [], '', '')
  }

  public static fromObject(o: any, tracks: Map<number, Track>): Playlist {
    return new Playlist(
      o.id,
      o.name,
      Track.getFromTracks(tracks, o.tracks),
      o.imageUrl,
      o.imageName
    )
  }

  public clone(p: Playlist = this): Playlist {
    return new Playlist(
      p.id,
      p.name,
      p.tracks,
      p.imageUrl,
      p.imageName
    )
  }

  public withId(id: number): Playlist {
    const clone = this.clone()
    clone.id = id
    return clone
  }

  public withName(name: string): Playlist {
    const clone = this.clone()
    clone.name = name
    return clone
  }

  public withTracks(tracks: Array<Track>): Playlist {
    const clone = this.clone()
    clone.tracks = tracks
    return clone
  }

  public withImageUrl(url: string): Playlist {
    const clone = this.clone()
    clone.imageUrl = url
    return clone
  }

  public withModifiedImage(): Playlist {
    const clone = this.clone()
    clone.imageModified = true
    return clone
  }

  public isImageModified(): boolean {
    return this.imageModified
  }

  public notifyImageDownloaded() {
    this.imageModified = false
  }

  public getId(): number {
    return this.id
  }

  public getName(): string {
    return this.name
  }

  public getTracks(): Array<Track> {
    return this.tracks
  }

  public getImageUrl(): string {
    return this.imageUrl
  }

  public getImageName(): string {
    if (this.imageName != null) {
      return this.imageName
    }
    return ''
  }
}