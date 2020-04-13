
import { Arrays } from '@utils/Immutable'
import Log from '@utils/Log'

import Track from '@models/Track'

export default class PlaylistManager {

  private tracks: Array<Track>
  private shuffledTracks: Array<Track>
  private current: Array<Track>
  private index: number
  private queue: Array<Track>

  constructor(tracks: Array<Track>, shuffledTracks = Arrays.shuffle(tracks), current = tracks, index = -1, queue: Array<Track> = []) {
    this.tracks = tracks
    this.shuffledTracks = shuffledTracks
    this.current = current
    this.index = index
    this.queue = queue
  }

  clone(p: PlaylistManager = this): PlaylistManager {
    return new PlaylistManager(p.tracks, p.shuffledTracks, p.current, p.index, p.queue)
  }

  enqueue(track: Track): PlaylistManager {
    return this.withQueue(Arrays.add(this.queue, track))
  }

  dequeue(): PlaylistManager {
    if (this.queue.length > 0) {
      const [ track, queue ] = Arrays.pop(this.queue)
      return this.withTrack(track).withQueue(queue)
    }
    Log.w('Cannot dequeue empty array')
    return this
  }

  withTrack(currentTrack: Track): PlaylistManager {
    const clone = this.clone()
    clone.index = this.current.findIndex(track => track.getId() === currentTrack.getId())
    return clone
  }

  withQueue(queue: Array<Track>): PlaylistManager {
    const clone = this.clone()
    clone.queue = queue
    return clone
  }

  withShuffleMode(shuffleMode: boolean): PlaylistManager {
    const clone = this.clone()
    clone.current = shuffleMode ? this.shuffledTracks : this.tracks
    return clone
  }

  withIndex(index: number): PlaylistManager {
    const clone = this.clone()
    clone.index = index
    return clone
  }

  getList(): Array<Track> {
    return this.current.slice(this.index, Math.min(this.index + 5, this.current.length))
  }

  getQueue(): Array<Track> {
    return this.queue
  }

  previous(): PlaylistManager {
    return this.withIndex((this.index - 1 + this.current.length) % this.current.length)
  }

  getCurrent(): Track | null {
    return this.index > -1 ? this.current[this.index] : null
  }

  next(): PlaylistManager {
    if (this.queue.length > 0) {
      return this.dequeue()
    }
    return this.withIndex((this.index + 1) % this.current.length)
  }
}