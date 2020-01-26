import PropTypes from 'prop-types'

export default class Track {

  constructor(id, title, artistId, artistName, duration, videoId, creationDate, status, startTime, endTime) {
    this.id = id
    this.title = title
    this.artistId = artistId
    this.artistName = artistName
    this.duration = duration
    this.videoId = videoId
    this.creationDate = creationDate
    this.status = status
    this.startTime = startTime
    this.endTime = endTime
  }

  static #with(t, property, value) {
    let copy = Track.fromTrack(t)
    copy[property] = value
    return copy
  }

  getId() {
    return this.id
  }

  withId(id) {
    return Track.#with(this, 'id', id)
  }

  getTitle() {
    return this.title
  }

  withTitle(title) {
    return Track.#with(this, 'title', title)
  }

  getArtistId() {
    return this.artistId
  }

  withArtistId(artistId) {
    return Track.#with(this, 'artistId', artistId)
  }

  getArtistName() {
    return this.artistName
  }

  withArtistName(artistName) {
    return Track.#with(this, 'artistName', artistName)
  }

  getDuration() {
    return this.duration
  }

  withDuration(duration) {
    return Track.#with(this, 'duration', duration)
  }

  getVideoId() {
    return this.videoId
  }

  withVideoId(videoId) {
    return Track.#with(this, 'videoId', videoId)
  }

  getCreationDate() {
    return this.creationDate
  }

  withCreationDate(creationDate) {
    return Track.#with(this, 'creationDate', creationDate)
  }

  getStatus() {
    return this.status
  }

  withStatus(status) {
    return Track.#with(this, 'status', status)
  }

  getStartTime() {
    return this.startTime
  }

  withStartTime(startTime) {
    return Track.#with(this, 'startTime', startTime)
  }


  getEndTime() {
    return this.endTime
  }

  withEndTime(startTime) {
    return Track.#with(this, 'endTime', endTime)
  }

  static fromTrack(t) {
    return new Track(
      t.getId(),
      t.getTitle(),
      t.getArtistId(),
      t.getArtistName(),
      t.getDuration(),
      t.getVideoId(),
      t.getCreationDate(),
      t.getStatus(),
      t.getStartTime(),
      t.getEndTime()
    )
  }

  static fromObject(o, artists) {
    const artist = artists.find(current => current.id === o.artist) || { name: 'Unknown' }
    return new Track(o.id, o.title, o.artist, artist.name, o.duration, o.videoId, o.creationDate, o.status, o.startTime, o.endTime)
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
  startTime: PropTypes.number.isRequired,
  endTime: PropTypes.number.isRequired,
}