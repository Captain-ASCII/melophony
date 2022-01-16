
import Playlist from '@models/Playlist'

export const SET_PLAYLISTS = 'SET_PLAYLISTS'
export const SET_PLAYLIST = 'SET_PLAYLIST'
export const ADD_PLAYLIST = 'ADD_PLAYLIST'
export const REMOVE_PLAYLIST = 'REMOVE_PLAYLIST'

interface SetPlaylistsAction {
  type: typeof SET_PLAYLISTS;
  playlists: Array<Playlist>;
}

interface SetPlaylistAction {
  type: typeof SET_PLAYLIST;
  playlist: Playlist;
}

interface AddPlaylistAction {
  type: typeof ADD_PLAYLIST;
  playlist: Playlist;
}

interface RemovePlaylistAction {
  type: typeof REMOVE_PLAYLIST;
  playlistId: number;
}

export const setPlaylists = (playlists: Array<Playlist>): SetPlaylistsAction => ({ type: SET_PLAYLISTS, playlists })
export const setPlaylist = (playlist: Playlist): SetPlaylistAction => ({ type: SET_PLAYLIST, playlist })
export const addPlaylist = (playlist: Playlist): AddPlaylistAction => ({ type: ADD_PLAYLIST, playlist })
export const removePlaylist = (playlist: Playlist): RemovePlaylistAction => ({ type: REMOVE_PLAYLIST, playlistId: playlist.getId() })

export type PlaylistAction = SetPlaylistsAction | SetPlaylistAction | AddPlaylistAction | RemovePlaylistAction