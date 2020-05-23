
import { AppAction, SET_PLAYLIST, SET_USER, SET_MEDIA_MANAGER, SET_API_MANAGER } from '@actions/App'

import AppStore from '@models/AppStore'

const INITIAL = new AppStore(null, null, null, null)

const app = (state = INITIAL, action: AppAction): AppStore => {
  switch (action.type) {
    case SET_PLAYLIST:
      return state.withPlaylist(action.playlist)
    case SET_USER:
      return state.withUser(action.user)
    case SET_MEDIA_MANAGER:
      return state.withMediaManager(action.mediaManager)
    case SET_API_MANAGER:
      return state.withApiManager(action.apiManager)
    default:
      return state
  }
}

export default app
