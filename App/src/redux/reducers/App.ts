
import { AppAction,
  SET_PLAYLIST_MANAGER,
  SET_USER,
  SET_MEDIA_MANAGER,
  SET_API_MANAGER,
  SET_KEYBOARD_MANAGER,
  SET_LANGUAGE,
} from '@actions/App'

import AppStore from '@models/AppStore'

const INITIAL = new AppStore(null, null, null, null, null, null)

const app = (state = INITIAL, action: AppAction): AppStore => {
  switch (action.type) {
    case SET_PLAYLIST_MANAGER:
      return state.withPlaylist(action.playlist)
    case SET_USER:
      return state.withUser(action.user)
    case SET_MEDIA_MANAGER:
      return state.withMediaManager(action.mediaManager)
    case SET_API_MANAGER:
      return state.withApiManager(action.apiManager)
    case SET_KEYBOARD_MANAGER:
      return state.withKeyboardManager(action.keyboardManager)
    case SET_LANGUAGE:
      return state.withLanguage(action.language)
    default:
      return state
  }
}

export default app
