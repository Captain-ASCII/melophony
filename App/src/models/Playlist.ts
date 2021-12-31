
import Track from '@models/Track'

export default class Playlist {

  private id: number
  private name: string
  private tracks: Array<Track>

  public constructor(id: number, name: string, tracks: Array<Track>) {
    this.id = id
    this.name = name
    this.tracks = tracks
  }

  public static fromObject(o: any): Playlist {
    return new Playlist(o.id, o.name, o.tracks.map((track: any) => Track.fromObject(track)))
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
}