import { Objects } from 'utils/Immutable'

import { NOTIFY_LISTENER, CLEAR_NOTIFICATION } from 'actions/Listener'

const INITIAL_CONFIG = {}

const listeners = (state = INITIAL_CONFIG, action) => {
  switch (action.type) {
    case NOTIFY_LISTENER:
      return Objects.update(state, action.id, action.notification)
    case CLEAR_NOTIFICATION:
      return Objects.removeAt(state, action.id)
    default:
      return state
  }
}

export default listeners
