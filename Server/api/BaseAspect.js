
export default class UserAspect {

  /* Databases */
  static USERS = 'users'
  static ARTISTS = 'artists'
  static TRACKS = 'tracks'
  static FILES = 'files'
  static MODIFIED_TRACKS = 'modifiedTracks'

  constructor(app, db) {
    this.app = app
    this.db = db
  }
}