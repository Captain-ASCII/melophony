import { useSelector } from 'react-redux'

export const selectArtists = () => useSelector(state => state.artists)

export const selectArtist = artistId => useSelector(state => state.artists.find(artist => artist.id === artistId))