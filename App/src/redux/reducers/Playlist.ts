import { SET_PLAYLISTS, SET_PLAYLIST, ADD_PLAYLIST, REMOVE_PLAYLIST, PlaylistAction } from '@actions/Playlist'

import { Arrays } from '@utils/Immutable'

import Playlist from '@models/Playlist'

const playlists = (state: Array<Playlist> = [], action: PlaylistAction): Array<Playlist> => {
  switch (action.type) {
    case SET_PLAYLISTS:
      return action.playlists
    case ADD_PLAYLIST:
      return Arrays.add(state, action.playlist)
      case REMOVE_PLAYLIST:
        return Arrays.remove(state, playlist => playlist.getId() === action.playlistId)
    case SET_PLAYLIST:
      return Arrays.updateWithCondition(state, action.playlist, playlist => playlist.getId() === action.playlist.getId())
    default:
      return state
  }
}

export default playlists
