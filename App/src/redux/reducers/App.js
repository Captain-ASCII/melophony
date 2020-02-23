import { Objects } from 'utils/Immutable'

import { SET_CURRENT_TRACK, SET_PLAYLIST } from 'actions/App'

const INITIAL_CONFIG = {}

const app = (state = INITIAL_CONFIG, action) => {
  switch (action.type) {
    case SET_CURRENT_TRACK:
      return Objects.update(state, 'currentTrack', action.track)
    case SET_PLAYLIST:
      return Objects.update(state, 'playlist', action.playlist)
    default:
      return state
  }
}

export default app
