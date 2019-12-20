import { useSelector } from 'react-redux'

export const selectTracks = () => useSelector(state => state.tracks)

export const selectTrack = trackId => useSelector(state => state.tracks.find(track => track.getId() === trackId))