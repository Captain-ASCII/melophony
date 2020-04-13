import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm'

import Track from '@models/Track'
import User from '@models/User'

@Entity()
export default class Playlist {

  static relations = [ 'user', 'tracks' ]

  @PrimaryGeneratedColumn()
  id = 0

  @Column()
  name: string

  @Column()
  userId!: number | null

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: User

  @ManyToMany(() => Track, track => track.playlists, { cascade: true })
  @JoinTable()
  tracks: Array<Track>

  constructor(name: string, user: User, tracks: Array<Track>) {
    this.name = name
    this.user = user
    this.tracks = tracks
  }
}