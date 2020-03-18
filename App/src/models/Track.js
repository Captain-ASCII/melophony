import PropTypes from 'prop-types'

import Model from 'models/Model'

export default class Track extends Model {

  constructor(id, title, artistId, artistName, duration, videoId, creationDate, status, startTime, endTime) {
    super()

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

  getId() {
    return this.id
  }

  withId(id) {
    return this.with('id', id)
  }

  getTitle() {
    return this.title
  }

  withTitle(title) {
    return this.with('title', title)
  }

  getArtistId() {
    return this.artistId
  }

  withArtistId(artistId) {
    return this.with('artistId', artistId)
  }

  getArtistName() {
    return this.artistName
  }

  withArtistName(artistName) {
    return this.with('artistName', artistName)
  }

  getDuration() {
    return this.duration
  }

  withDuration(duration) {
    return this.with('duration', duration)
  }

  getVideoId() {
    return this.videoId
  }

  withVideoId(videoId) {
    return this.with('videoId', videoId)
  }

  getCreationDate() {
    return this.creationDate
  }

  withCreationDate(creationDate) {
    return this.with('creationDate', creationDate)
  }

  getStatus() {
    return this.status
  }

  withStatus(status) {
    return this.with('status', status)
  }

  getStartTime() {
    return this.startTime
  }

  withStartTime(startTime) {
    return this.with('startTime', startTime)
  }


  getEndTime() {
    return this.endTime
  }

  withEndTime(endTime) {
    return this.with('endTime', endTime)
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