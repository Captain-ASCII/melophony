
export const SET_ARTIST = 'SET_ARTIST'
export const SET_ARTISTS = 'SET_ARTISTS'

export const setArtist = artist => ({ type: SET_ARTIST, id: artist.getId(), artist })

export const setArtists = artists => ({ type: SET_ARTISTS, artists })