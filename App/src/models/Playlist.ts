
import Track from '@models/Track'

export default class Playlist {

  private name: string
  private tracks: Array<Track>

  constructor(name: string, tracks: Array<Track>) {
    this.name = name
    this.tracks = tracks
  }

  getName(): string {
    return this.name
  }

  getTracks(): Array<Track> {
    return this.tracks
  }
}