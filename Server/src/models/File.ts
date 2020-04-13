import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'

import Track from '@models/Track'

enum FileState {
  UNAVAILABLE,
  AVAILABLE,
  ERROR,
  DOWNLOADING,
}

@Entity()
export default class File {

  static relations = [ 'tracks' ]

  @PrimaryGeneratedColumn()
  id = 0

  @OneToMany(() => Track, track => track.file)
  tracks: Array<Track>

  @Column()
  videoId: string

  @Column()
  state: FileState

  constructor(videoId: string, state: FileState, tracks: Array<Track>) {
    this.videoId = videoId
    this.state = state
    this.tracks = tracks
  }
}

export { FileState }