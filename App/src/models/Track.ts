
import Album from '@models/Album'
import Artist from '@models/Artist'
import File from '@models/File'
import Playlist from '@models/Playlist'

export default class Track {

  private id: number
  private title: string
  private artists: Array<Artist>
  private duration: number
  private file: File
  private creationDate: Date
  private startTime: number
  private endTime: number
  private lastPlay: Date
  private playCount: number
  private rating: number
  private progress: number
  private playlists: Array<Playlist>
  private album: Album

  public constructor(id: number, title: string, artists: Array<Artist>, duration: number, file: File, creationDate: Date, startTime: number, endTime: number,
    lastPlay: Date, playCount: number, rating: number, progress: number, playlists: Array<Playlist>, album: Album) {
    this.id = id
    this.title = title
    this.artists = artists
    this.duration = duration
    this.file = file
    this.creationDate = creationDate
    this.startTime = startTime
    this.endTime = endTime
    this.lastPlay = lastPlay
    this.playCount = playCount
    this.rating = rating
    this.progress = progress
    this.playlists = playlists
    this.album = album
  }

  public clone(t: Track = this): Track {
    return new Track(
      t.id,
      t.title,
      t.artists,
      t.duration,
      t.file,
      t.creationDate,
      t.startTime,
      t.endTime,
      t.lastPlay,
      t.playCount,
      t.rating,
      t.progress,
      t.playlists,
      t.album,
    )
  }

  public static fromObject(o: any): Track | null {
    if (o) {
      return new Track(
        o.id,
        o.title,
        Artist.fromArray(o.artists),
        o.duration,
        File.fromObject(o.file),
        new Date(o.creationDate),
        o.startTime,
        o.endTime,
        o.lastPlay,
        o.playCount,
        o.rating,
        o.progress,
        o.playlists,
        o.album,
      )
    }
    return null
  }

  public withId(id: number): Track {
    const clone = this.clone()
    clone.id = id
    return clone
  }

  public withTitle(title: string): Track {
    const clone = this.clone()
    clone.title = title
    return clone
  }

  public withArtists(artists: Array<Artist>): Track {
    const clone = this.clone()
    clone.artists = artists
    return clone
  }

  public withDuration(duration: number): Track {
    const clone = this.clone()
    clone.duration = duration
    return clone
  }

  public withFile(file: File): Track {
    const clone = this.clone()
    clone.file = file
    return clone
  }

  public withCreationDate(creationDate: Date): Track {
    const clone = this.clone()
    clone.creationDate = creationDate
    return clone
  }

  public withStartTime(startTime: number): Track {
    const clone = this.clone()
    clone.startTime = startTime
    return clone
  }

  public withEndTime(endTime: number): Track {
    const clone = this.clone()
    clone.endTime = endTime
    return clone
  }


  public getId(): number {
    return this.id
  }

  public getTitle(): string {
    return this.title
  }

  public getArtist(): Artist {
    if (this.artists.length == 0) {
      return new Artist(-1, "Unknown")
    }
    return this.artists[0]
  }

  public getArtists(): Array<Artist> {
    return this.artists
  }

  public getDuration(): number {
    return this.duration
  }

  public getFile(): File {
    return this.file
  }

  public getCreationDate(): Date {
    return this.creationDate
  }

  public getStartTime(): number {
    return this.startTime
  }

  public getEndTime(): number {
    return this.endTime
  }
}