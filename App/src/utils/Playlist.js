import { Arrays } from 'utils/Immutable'
import Log from 'utils/Log'

export default class Playlist {
  constructor(tracks) {
    this.tracks = tracks
    this.shuffledTracks = Arrays.shuffle(tracks)
    this.current = this.tracks
    this.index = 0
    this.queue = []
  }

  enqueue(track) {
    this.queue = Arrays.add(this.queue, track)
  }

  dequeue() {
    if (this.queue.length > 0) {
      let track
      [track, this.queue] = Arrays.pop(this.queue)

      return track
    }
    Log.w('Cannot dequeue empty array')
    return null
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

  getPrevious() {
    this.index = (this.index - 1 + this.current.length) % this.current.length
    return this.current[this.index]
  }

  getNext() {
    if (this.queue.length > 0) {
      return this.dequeue()
    }
    this.index = (this.index + 1) % this.current.length
    return this.current[this.index]
  }
}