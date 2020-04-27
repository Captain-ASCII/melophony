
import { Arrays } from '@utils/Immutable'
import Log from '@utils/Log'

import Track from '@models/Track'

export default class PlaylistManager {

  private tracks: Array<Track>
  private shuffledTracks: Array<Track>
  private current: Array<Track>
  private index: number
  private currentTrack: Track | null
  private queue: Array<Track>

  public constructor(tracks: Array<Track>, shuffledTracks = Arrays.shuffle(tracks),
    current = tracks, currentTrack: Track | null = null, index = -1, queue: Array<Track> = []) {

    this.tracks = tracks
    this.shuffledTracks = shuffledTracks
    this.current = current
    this.currentTrack = currentTrack
    this.index = index
    this.queue = queue
  }

  public clone(p: PlaylistManager = this): PlaylistManager {
    return new PlaylistManager(p.tracks, p.shuffledTracks, p.current, p.currentTrack, p.index, p.queue)
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
    clone.index = this.current.findIndex(track => track.getId() === currentTrack.getId())
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
    clone.current = shuffleMode ? this.shuffledTracks : this.tracks
    return clone
  }

  public withIndex(index: number): PlaylistManager {
    const clone = this.clone()
    clone.index = index
    clone.currentTrack = clone.current[clone.index]
    return clone
  }

  public getList(): Array<Track> {
    return this.current.slice(this.index, Math.min(this.index + 5, this.current.length))
  }

  public getQueue(): Array<Track> {
    return this.queue
  }

  public previous(): PlaylistManager {
    return this.withIndex((this.index - 1 + this.current.length) % this.current.length)
  }

  public getCurrent(): Track | null {
    return this.currentTrack
  }

  public next(): PlaylistManager {
    if (this.queue.length > 0) {
      return this.dequeue()
    }
    return this.withIndex((this.index + 1) % this.current.length)
  }
}