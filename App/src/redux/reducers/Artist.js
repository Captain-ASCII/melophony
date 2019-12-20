import { SET_ARTISTS } from 'actions/Artist'

const artists = (state = [], action) => {
  switch (action.type) {
    case SET_ARTISTS:
      return action.artists
    default:
      return state
  }
}

export default artists
