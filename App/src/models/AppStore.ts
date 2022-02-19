
import PlaylistManager from '@models/PlaylistManager'
import User from '@models/User'

import ApiManager from '@utils/ApiManager'
import KeyboardManager from '@utils/KeyboardManager'
import MediaManager from '@utils/MediaManager'

export default class AppStore {

  playlist: PlaylistManager
  user: User

  mediaManager: MediaManager
  apiManager: ApiManager
  keyboardManager: KeyboardManager

  constructor(playlist: PlaylistManager, mediaManager: MediaManager, apiManager: ApiManager, user: User, keyboardManager: KeyboardManager) {
    this.playlist = playlist
    this.user = user

    this.mediaManager = mediaManager
    this.apiManager = apiManager
    this.keyboardManager = keyboardManager
  }

  clone({ playlist = this.playlist, mediaManager = this.mediaManager, apiManager = this.apiManager, user = this.user, keyboardManager = this.keyboardManager}): AppStore {
    return new AppStore(playlist, mediaManager, apiManager, user, keyboardManager)
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

  withKeyboardManager(keyboardManager: KeyboardManager): AppStore {
    return this.clone({ keyboardManager })
  }
}