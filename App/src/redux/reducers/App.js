import { Objects } from 'utils/Immutable'

import { SET_CURRENT_TRACK } from 'actions/App'

const INITIAL_CONFIG = {}

const app = (state = INITIAL_CONFIG, action) => {
  switch (action.type) {
    case SET_CURRENT_TRACK:
      return Objects.update(state, 'currentTrack', action.track)
    default:
      return state
  }
}

export default app
