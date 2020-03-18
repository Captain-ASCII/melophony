import { Arrays } from 'utils/Immutable'
import Log from 'utils/Log'

import Model from 'models/Model'

export default class Playlist extends Model {

  constructor(tracks, shuffledTracks = Arrays.shuffle(tracks), current = tracks, index = -1, queue = []) {
    super()

    this.tracks = tracks
    this.shuffledTracks = shuffledTracks
    this.current = current
    this.index = index
    this.queue = queue
  }

  enqueue(track) {
    return this.with('queue', Arrays.add(this.queue, track))
  }

  dequeue() {
    if (this.queue.length > 0) {
      const [ track, queue ] = Arrays.pop(this.queue)
      return this.withTrack(track).with('queue', queue)
    }
    Log.w('Cannot dequeue empty array')
    return this
  }

  withTrack(currentTrack) {
    return this.with('index', this.current.findIndex(track => track.getId() === currentTrack.getId()))
  }

  withShuffleMode(shuffleMode) {
    return this.with('current', shuffleMode ? this.shuffledTracks : this.tracks)
  }

  getList() {
    return this.current.slice(this.index, Math.min(this.index + 5, this.current.length))
  }

  getQueue() {
    return this.queue
  }

  previous() {
    return this.with('index', (this.index - 1 + this.current.length) % this.current.length)
  }

  getCurrent() {
    return this.index > -1 ? this.current[this.index] : null
  }

  next() {
    if (this.queue.length > 0) {
      return this.dequeue()
    }
    return this.with('index', (this.index + 1) % this.current.length)
  }
}