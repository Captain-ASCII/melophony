
import PlaylistManager from '@models/PlaylistManager'
import User from '@models/User'

import ApiManager from '@utils/ApiManager'
import MediaManager from '@utils/MediaManager'

export default class AppStore {

  playlist: PlaylistManager
  user: User

  mediaManager: MediaManager
  apiManager: ApiManager

  constructor(playlist: PlaylistManager, mediaManager: MediaManager, apiManager: ApiManager, user: User) {
    this.playlist = playlist
    this.user = user

    this.mediaManager = mediaManager
    this.apiManager = apiManager
  }

  clone({ playlist = this.playlist, mediaManager = this.mediaManager, apiManager = this.apiManager, user = this.user }): AppStore {
    return new AppStore(playlist, mediaManager, apiManager, user)
  }

  withPlaylist(playlist: PlaylistManager): AppStore {
    return this.clone({ playlist })
  }

  withUser(user: User): AppStore {
    return this.clone({ user })
  }

  withMediaManager(mediaManager: MediaManager): AppStore {
    return this.clone({ mediaManager })
  }

  withApiManager(apiManager: ApiManager): AppStore {
    return this.clone({ apiManager })
  }
}