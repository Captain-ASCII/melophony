import { useSelector } from 'react-redux'

import { RootState } from '@store'

import Track from '@models/Track'

export const selectTracks = (): Array<Track> => useSelector((state: RootState) => state.tracks)

export const selectTrack = (trackId: number): Track =>
  useSelector((state: RootState) => state.tracks.find((track: Track) => track.getId() === trackId))