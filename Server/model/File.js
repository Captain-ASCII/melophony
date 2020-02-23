
import Track from './Track'

export default class File {

  constructor(videoId) {
    this.id = videoId
    this.size = 1
    this.state = Track.UNAVAILABLE
  }
}
