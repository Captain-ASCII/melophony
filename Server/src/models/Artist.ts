import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm'

import Track from '@models/Track'
import User from '@models/User'

@Entity()
export default class Artist {

  static relations = [ 'tracks' ]

  @PrimaryGeneratedColumn()
  id = 0

  @Column()
  name: string

  @Column()
  userId!: number | null

  @ManyToOne(() => User, user => user.artists)
  user: User | null

  @OneToMany(() => Track, track => track.artist)
  tracks: Array<Track>

  constructor(name = 'Unknown', user: User | null, tracks: Array<Track>) {
    this.name = name
    this.user = user
    this.tracks = tracks
  }
}