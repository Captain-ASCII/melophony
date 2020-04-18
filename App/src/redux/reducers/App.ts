
import { SET_PLAYLIST, SET_MEDIA_MANAGER, SET_API_MANAGER, AppAction } from '@actions/App'

import AppStore from '@models/AppStore'
import PlaylistManager from '@models/PlaylistManager'

const INITIAL = new AppStore(new PlaylistManager([]), null, null)

const app = (state = INITIAL, action: AppAction): AppStore => {
  switch (action.type) {
    case SET_PLAYLIST:
      return state.clone().withPlaylist(action.playlist)
    case SET_MEDIA_MANAGER:
      return state.clone().withMediaManager(action.mediaManager)
    case SET_API_MANAGER:
      return state.clone().withApiManager(action.apiManager)
    default:
      return state
  }
}

export default app
