import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'

import Track from '@models/Track'

@Entity()
export default class Album {

  static relations = [ 'tracks' ]

  @PrimaryGeneratedColumn()
  id = 0

  @Column()
  name: string

  @OneToMany(() => Track, track => track.album)
  tracks: Array<Track>

  constructor(name: string, tracks: Array<Track>) {
    this.name = name
    this.tracks = tracks
  }
}