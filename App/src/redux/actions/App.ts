
import PlaylistManager from '@models/PlaylistManager'
import User from '@models/User'

import ApiManager from '@utils/ApiManager'
import MediaManager from '@utils/MediaManager'
import KeyboardManager from '@utils/KeyboardManager'

export const SET_PLAYLIST_MANAGER = 'SET_PLAYLIST_MANAGER'
export const SET_USER = 'SET_USER'

interface SetPlaylistManagerAction {
  type: typeof SET_PLAYLIST_MANAGER;
  playlist: PlaylistManager;
}
interface SetUserAction {
  type: typeof SET_USER;
  user: User;
}

export const setPlaylistManager = (playlist: PlaylistManager): AppAction => ({ type: SET_PLAYLIST_MANAGER, playlist })
export const setUser = (user: User): AppAction => ({ type: SET_USER, user })

export const SET_API_MANAGER = 'SET_API_MANAGER'
export const SET_MEDIA_MANAGER = 'SET_MEDIA_MANAGER'
export const SET_KEYBOARD_MANAGER = 'SET_KEYBOARD_MANAGER'

interface SetMediaManagerAction {
  type: typeof SET_MEDIA_MANAGER;
  mediaManager: MediaManager;
}
interface SetApiManagerAction {
  type: typeof SET_API_MANAGER;
  apiManager: ApiManager;
}
interface SetKeyboardManagerAction {
  type: typeof SET_KEYBOARD_MANAGER;
  keyboardManager: KeyboardManager;
}

export const setMediaManager = (mediaManager: MediaManager): AppAction => ({ type: SET_MEDIA_MANAGER, mediaManager })
export const setApiManager = (apiManager: ApiManager): AppAction => ({ type: SET_API_MANAGER, apiManager })
export const setKeyboardManager = (keyboardManager: KeyboardManager): AppAction => ({ type: SET_KEYBOARD_MANAGER, keyboardManager })

export type AppAction = SetPlaylistManagerAction | SetUserAction | SetMediaManagerAction | SetApiManagerAction | SetKeyboardManagerAction
