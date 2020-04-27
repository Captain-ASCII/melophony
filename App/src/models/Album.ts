
import Track from '@models/Track'

export default class Album {

  private name: string
  private tracks: Array<Track>

  public constructor(name: string, tracks: Array<Track>) {
    this.name = name
    this.tracks = tracks
  }

  public getName(): string {
    return this.name
  }

  public getTracks(): Array<Track> {
    return this.tracks
  }
}