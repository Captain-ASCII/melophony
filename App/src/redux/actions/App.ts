
import PlaylistManager from '@models/PlaylistManager'
import User from '@models/User'

import ApiManager from '@utils/ApiManager'
import MediaManager from '@utils/MediaManager'

export const SET_PLAYLIST = 'SET_PLAYLIST'
export const SET_USER = 'SET_USER'

interface SetPlaylistAction {
  type: typeof SET_PLAYLIST;
  playlist: PlaylistManager;
}
interface SetUserAction {
  type: typeof SET_USER;
  user: User;
}

export const setPlaylist = (playlist: PlaylistManager): AppAction => ({ type: SET_PLAYLIST, playlist })
export const setUser = (user: User): AppAction => ({ type: SET_USER, user })

export const SET_API_MANAGER = 'SET_API_MANAGER'
export const SET_MEDIA_MANAGER = 'SET_MEDIA_MANAGER'

interface SetMediaManagerAction {
  type: typeof SET_MEDIA_MANAGER;
  mediaManager: MediaManager;
}
interface SetApiManagerAction {
  type: typeof SET_API_MANAGER;
  apiManager: ApiManager;
}

export const setMediaManager = (mediaManager: MediaManager): AppAction => ({ type: SET_MEDIA_MANAGER, mediaManager })
export const setApiManager = (apiManager: ApiManager): AppAction => ({ type: SET_API_MANAGER, apiManager })

export type AppAction = SetPlaylistAction | SetUserAction | SetMediaManagerAction | SetApiManagerAction
