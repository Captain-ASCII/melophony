
import Artist from './Artist'
import * as ModelUtils from './ModelUtils'

function getArtistId(newArtistName, artists) {
  for (let artistId in artists) {
    if (artists[artistId].name.toUpperCase() === newArtistName.toUpperCase()) {
      return artistId
    }
  }
  let artist = new Artist(newArtistName)
  artists[artist.id] = artist
  return artist.id
}

export default class Track {

  static UNAVAILABLE = 'unavailable'
  static DOWNLOADING = 'downloading'
  static AVAILABLE = 'available'
  static DELETED = 'deleted'

  constructor(videoTitle, duration, artists, videoId) {
    let length = videoTitle.indexOf(' - ')
    let artistName = (length < 0) ? videoTitle : videoTitle.substring(0, length)
    let title = (length < 0) ? videoTitle : videoTitle.substring(length + 3, videoTitle.length)

    this.id = ModelUtils.generateId()
    this.title = title
    this.artist = 'Artist'

    this.videoId = videoId
    this.artist = getArtistId(artistName, artists)
    this.album = 'Unknown'
    this.imageSrc = { uri: `https://i.ytimg.com/vi/${this.videoId}/mqdefault.jpg` }
    this.imageExtension = 'jpg'
    this.creationDate = new Date().toISOString()
    this.status = 'Unavailable'
    this.duration = parseInt(duration)
    this.startTime = 0
    this.endTime = parseInt(duration)
    this.lastPlay = ''
    this.playCount = 0
    this.rating = 0
    this.progress = 0
  }
}
