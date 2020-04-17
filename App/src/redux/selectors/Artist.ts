import { useSelector } from 'react-redux'

import { RootState } from '@store'

import Artist from '@models/Artist'

export const selectArtists = (): Array<Artist> =>
  useSelector((state: RootState) => state.artists)

export const selectArtist = (artistId: number): Artist =>
  useSelector((state: RootState) => state.artists.find((artist: Artist) => artist.getId() === artistId))