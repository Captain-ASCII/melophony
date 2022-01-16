
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

  public clone(p: Playlist = this): Playlist {
    return new Playlist(
      p.id,
      p.name,
      p.tracks
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