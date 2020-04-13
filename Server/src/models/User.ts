import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinTable } from 'typeorm'

import IntegrityUtils, { IntegrityResult } from '@utils/IntegrityUtils'

import Playlist from '@models/Playlist'
import Artist from '@models/Artist'
import Track from '@models/Track'

@Entity()
export default class User {

  static relations = [ 'artists', 'playlists' ]

  @PrimaryGeneratedColumn()
  id = 0

  @Column({ unique: true })
  email: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  password: string

  @OneToMany(() => Artist, artist => artist.user)
  artists: Array<Artist>

  @OneToMany(() => Track, track => track.user)
  tracks: Array<Track>

  @OneToMany(() => Playlist, playlist => playlist.user)
  playlists: Array<Playlist>

  constructor(email: string, firstName: string, lastName: string, password: string, tracks: Array<Track>, artists: Array<Artist>, playlists: Array<Playlist>) {
    this.email = email
    this.firstName = firstName
    this.lastName = lastName
    this.password = password
    this.tracks = tracks
    this.artists = artists
    this.playlists = playlists
  }

  getMainPlaylist(): Playlist | null {
    if (this.playlists && this.playlists.length > 0) {
      return this.playlists[0]
    }
    return null
  }

  static assertCorrect(object: any): IntegrityResult {
    const result = new IntegrityResult()
    result.withResult(IntegrityUtils.assertRequired(['email', 'firstName', 'lastName', 'password'], object))
    result.withResult(new IntegrityResult(object.password.length >= 8, 'Password is not long enough (min: 8 characters)'))

    return result
  }
}
