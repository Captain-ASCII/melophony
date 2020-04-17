
import ApiManager from '@utils/ApiManager'
import MediaManager from '@utils/MediaManager'
import PlaylistManager from '@models/PlaylistManager'

export const SET_PLAYLIST = 'SET_PLAYLIST'
export const SET_MEDIA_MANAGER = 'SET_MEDIA_MANAGER'
export const SET_API_MANAGER = 'SET_API_MANAGER'

interface SetPlaylistAction {
  type: typeof SET_PLAYLIST;
  playlist: PlaylistManager;
}

interface SetMediaManagerAction {
  type: typeof SET_MEDIA_MANAGER;
  mediaManager: MediaManager;
}
interface SetApiManagerAction {
  type: typeof SET_API_MANAGER;
  apiManager: ApiManager;
}

export type AppAction = SetPlaylistAction | SetMediaManagerAction | SetApiManagerAction

export const setPlaylist = (playlist: PlaylistManager): AppAction => ({ type: SET_PLAYLIST, playlist })
export const setMediaManager = (mediaManager: MediaManager): AppAction => ({ type: SET_MEDIA_MANAGER, mediaManager })
export const setApiManager = (apiManager: ApiManager): AppAction => ({ type: SET_API_MANAGER, apiManager })
