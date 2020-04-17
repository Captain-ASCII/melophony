
import ApiManager from '@utils/ApiManager'
import MediaManager from '@utils/MediaManager'
import PlaylistManager from '@models/PlaylistManager'

export default class AppStore {

  playlist: PlaylistManager

  mediaManager: MediaManager
  apiManager: ApiManager

  constructor(playlist: PlaylistManager, mediaManager: MediaManager, apiManager: ApiManager) {
    this.playlist = playlist
    this.mediaManager = mediaManager
    this.apiManager = apiManager
  }

  clone(): AppStore {
    return new AppStore(this.playlist, this.mediaManager, this.apiManager)
  }

  withPlaylist(playlist: PlaylistManager): AppStore {
    this.playlist = playlist
    return this
  }

  withMediaManager(mediaManager: MediaManager): AppStore {
    this.mediaManager = mediaManager
    return this
  }

  withApiManager(apiManager: ApiManager): AppStore {
    this.apiManager = apiManager
    return this
  }
}