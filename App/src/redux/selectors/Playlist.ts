import { useSelector } from 'react-redux'

import { RootState } from '@store'

import Playlist from '@models/Playlist'

export const selectPlaylists = (): Array<Playlist> => useSelector((state: RootState) => state.playlists)

export const selectPlaylist = (playlistId: number): Playlist =>
  useSelector((state: RootState) => state.playlists.find((playlist: Playlist) => playlist.getId() === playlistId))