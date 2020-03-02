import { Arrays } from 'utils/Immutable'
import Log from 'utils/Log'

import Model from 'models/Model'

export default class Playlist extends Model {

  constructor(tracks, shuffledTracks = Arrays.shuffle(tracks), current = tracks, index = 0, queue = []) {
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
      const [track, queue] = Arrays.pop(this.queue)
      return [ track, this.with('queue', queue) ]
    }
    Log.w('Cannot dequeue empty array')
    return [ null, this ]
  }

  setTrack(currentTrack) {
    this.index = this.current.findIndex(track => track.getId() === currentTrack.getId())
  }

  setShuffleMode(shuffleMode) {
    if (shuffleMode) {
      this.current = this.shuffledTracks
    } else {
      this.current = this.tracks
    }
  }

  getQueue() {
    return this.queue
  }

  getPrevious() {
    this.index = (this.index - 1 + this.current.length) % this.current.length
    return this.current[this.index]
  }

  getNext() {
    if (this.queue.length > 0) {
      return this.dequeue()
    }
    this.index = (this.index + 1) % this.current.length
    return [ this.current[this.index], this ]
  }
}