import { Arrays } from '@utils/Immutable'

import { SET_ARTIST, SET_ARTISTS, ArtistAction } from '@actions/Artist'

import Artist from '@models/Artist'

const artists = (state: Array<Artist> = [], action: ArtistAction): Array<Artist> => {
  switch (action.type) {
    case SET_ARTIST:
      return Arrays.updateWithCondition(state, action.artist, (a: Artist) => a.getId() === action.artist.getId())
    case SET_ARTISTS:
      return action.artists
    default:
      return state
  }
}

export default artists
