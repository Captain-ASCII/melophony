
import Album from '@models/Album'
import Artist from '@models/Artist'
import File from '@models/File'
import Playlist from '@models/Playlist'

export default class Track {

  private id: number
  private title: string
  private artist: Artist
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

  constructor(id: number, title: string, artist: Artist, duration: number, file: File, creationDate: Date, startTime: number, endTime: number,
              lastPlay: Date, playCount: number, rating: number, progress: number, playlists: Array<Playlist>, album: Album) {
    this.id = id
    this.title = title
    this.artist = artist
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

  clone(t: Track = this): Track {
    return new Track(
      t.id,
      t.title,
      t.artist,
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

  withId(id: number): Track {
    const clone = this.clone()
    clone.id = id
    return clone
  }

  withTitle(title: string): Track {
    const clone = this.clone()
    clone.title = title
    return clone
  }

  withArtist(artist: Artist): Track {
    const clone = this.clone()
    clone.artist = artist
    return clone
  }

  withDuration(duration: number): Track {
    const clone = this.clone()
    clone.duration = duration
    return clone
  }

  withFile(file: File): Track {
    const clone = this.clone()
    clone.file = file
    return clone
  }

  withCreationDate(creationDate: Date): Track {
    const clone = this.clone()
    clone.creationDate = creationDate
    return clone
  }

  withStartTime(startTime: number): Track {
    const clone = this.clone()
    clone.startTime = startTime
    return clone
  }

  withEndTime(endTime: number): Track {
    const clone = this.clone()
    clone.endTime = endTime
    return clone
  }


  getId(): number {
    return this.id
  }

  getTitle(): string {
    return this.title
  }

  getArtist(): Artist {
    return this.artist
  }

  getDuration(): number {
    return this.duration
  }

  getFile(): File {
    return this.file
  }

  getCreationDate(): Date {
    return this.creationDate
  }

  getStartTime(): number {
    return this.startTime
  }

  getEndTime(): number {
    return this.endTime
  }

  static fromObject(o: any): Track {
    return new Track(
      o.id,
      o.title,
      new Artist(o.artist.id, o.artist.name),
      o.duration,
      new File(o.file.id, o.file.videoId, o.file.state),
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
}