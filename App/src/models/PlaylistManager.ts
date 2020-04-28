
import { Arrays } from '@utils/Immutable'
import Log from '@utils/Log'

import Track from '@models/Track'

export default class PlaylistManager {

  private initialTracks: Array<Track>
  private tracks: Array<Track>
  private shuffleMode: boolean
  private index: number
  private currentTrack: Track | null
  private queue: Array<Track>

  public constructor(tracks: Array<Track>, shuffleMode: boolean, initialTracks = tracks, currentTrack: Track | null = null, index = -1, queue: Array<Track> = [], cloning = false) {

    this.shuffleMode = shuffleMode
    this.initialTracks = initialTracks
    if (cloning) {
      this.tracks = tracks
    } else {
      this.tracks = shuffleMode ? Arrays.shuffle(tracks) : this.initialTracks
    }
    this.currentTrack = currentTrack
    this.index = index
    this.queue = queue
  }

  public clone(p: PlaylistManager = this): PlaylistManager {
    return new PlaylistManager(p.tracks, p.shuffleMode, p.initialTracks, p.currentTrack, p.index, p.queue, true)
  }

  public enqueue(track: Track): PlaylistManager {
    return this.withQueue(Arrays.add(this.queue, track))
  }

  public dequeue(): PlaylistManager {
    if (this.queue.length > 0) {
      const [ track, queue ] = Arrays.pop(this.queue)
      return this.withTrack(track).withQueue(queue)
    }
    Log.w('Cannot dequeue empty array')
    return this
  }

  public withTrack(currentTrack: Track): PlaylistManager {
    const clone = this.clone()
    clone.index = this.tracks.findIndex(track => track.getId() === currentTrack.getId())
    clone.currentTrack = currentTrack
    return clone
  }

  public withQueue(queue: Array<Track>): PlaylistManager {
    const clone = this.clone()
    clone.queue = queue
    return clone
  }

  public withShuffleMode(shuffleMode: boolean): PlaylistManager {
    const clone = this.clone()
    if (shuffleMode) {
      clone.tracks = Arrays.shuffle(this.tracks)
    } else {
      clone.tracks = this.initialTracks
    }
    clone.index = -1
    return clone
  }

  public withIndex(index: number): PlaylistManager {
    const clone = this.clone()
    clone.index = index
    clone.currentTrack = clone.tracks[clone.index]
    return clone
  }

  public getList(): Array<Track> {
    const startIndex = Math.max(0, this.index)
    if (startIndex > this.tracks.length - 5) {
      return [ ...this.tracks.slice(startIndex, this.tracks.length), ...this.tracks.slice(0, startIndex - this.tracks.length + 5) ]
    }
    return this.tracks.slice(startIndex, startIndex + 5)
  }

  public getQueue(): Array<Track> {
    return this.queue
  }

  public previous(): PlaylistManager {
    return this.withIndex((this.index - 1 + this.tracks.length) % this.tracks.length)
  }

  public getCurrent(): Track | null {
    return this.currentTrack
  }

  public next(): PlaylistManager {
    if (this.queue.length > 0) {
      return this.dequeue()
    }
    return this.withIndex((this.index + 1) % this.tracks.length)
  }
}