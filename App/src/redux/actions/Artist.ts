
import Artist from '@models/Artist'

export const SET_ARTIST = 'SET_ARTIST'
export const SET_ARTISTS = 'SET_ARTISTS'

interface SetArtistAction {
  type: typeof SET_ARTIST;
  id: number;
  artist: Artist;
}

interface SetArtistsAction {
  type: typeof SET_ARTISTS;
  artists: Array<Artist>;
}

export const setArtist = (artist: Artist): SetArtistAction => ({ type: SET_ARTIST, id: artist.getId(), artist })
export const setArtists = (artists: Array<Artist>): SetArtistsAction => ({ type: SET_ARTISTS, artists })

export type ArtistAction = SetArtistAction | SetArtistsAction