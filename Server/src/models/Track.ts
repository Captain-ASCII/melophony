import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany } from 'typeorm'

import Album from '@models/Album'
import Artist from '@models/Artist'
import File from '@models/File'
import Playlist from '@models/Playlist'
import User from './User'

@Entity()
export default class Track {

  static relations = [ 'artist', 'file', 'album', 'playlists' ]

  @PrimaryGeneratedColumn()
  id = 0

  @Column()
  title: string

  @Column()
  userId!: number | null

  @ManyToOne(() => User, user => user.tracks)
  user: User | null

  @ManyToOne(() => Artist, artist => artist.tracks)
  artist?: Artist | null

  @ManyToOne(() => File, file => file.tracks)
  file?: File | null

  @ManyToOne(() => Album, album => album.tracks)
  album?: Album | null

  @ManyToMany(() => Playlist, playlist => playlist.tracks)
  playlists?: Array<Playlist>

  @Column()
  creationDate: Date

  @Column()
  duration: number

  @Column()
  startTime: number

  @Column()
  endTime: number

  @Column()
  lastPlay: Date

  @Column()
  playCount: number

  @Column()
  rating: number

  @Column()
  progress: number

  constructor(title: string, duration: number, user: User, artist: Artist | null, album: Album | null, file: File | null, playlists: Array<Playlist>) {
    this.title = title
    this.user = user
    this.artist = artist
    this.album = album
    this.file = file
    this.playlists = playlists

    this.creationDate = new Date()
    this.duration = duration
    this.startTime = 0
    this.endTime = duration
    this.lastPlay = new Date()
    this.playCount = 0
    this.rating = 0
    this.progress = 0
  }
}
