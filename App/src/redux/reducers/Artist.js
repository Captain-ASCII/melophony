import Arrays from 'utils/Arrays'

import { SET_ARTIST, SET_ARTISTS } from 'actions/Artist'

const artists = (state = [], action) => {
  switch (action.type) {
    case SET_ARTIST:
      return Arrays.update(state, action.id, action.artist)
    case SET_ARTISTS:
      return action.artists
    default:
      return state
  }
}

export default artists
