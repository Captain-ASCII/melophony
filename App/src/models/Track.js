import PropTypes from 'prop-types'

export default class Track {

  constructor(id, title, artistId, artistName, duration, videoId, creationDate, status) {
    this.id = id
    this.title = title
    this.artistId = artistId
    this.artistName = artistName
    this.duration = duration
    this.videoId = videoId
    this.creationDate = creationDate
    this.status = status
  }

  getId() {
    return this.id
  }

  getTitle() {
    return this.title
  }

  getArtistId() {
    return this.artistId
  }

  getArtistName() {
    return this.artistName
  }

  getDuration() {
    return this.duration
  }

  getVideoId() {
    return this.videoId
  }

  getCreationDate() {
    return this.creationDate
  }

  getStatus() {
    return this.status
  }

  static fromObject(o, artists) {
    const artist = artists.find(current => current.id === o.artist) || { name: 'Unknown' }
    return new Track(o.id, o.title, o.artist, artist.name, o.duration, o.videoId, o.creationDate, o.status)
  }
}

export const TrackPropTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  artistId: PropTypes.string.isRequired,
  artistName: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  videoId: PropTypes.string.isRequired,
  creationDate: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
}