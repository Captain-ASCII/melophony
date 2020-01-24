import Arrays from 'utils/Arrays'

import { ADD_LISTENER, CLEAR_LISTENERS, NOTIFY_LISTENER } from 'actions/Listener'

const INITIAL_CONFIG = {
  listeners: []
}

const overlay = (state = INITIAL_CONFIG, action) => {
  switch (action.type) {
    case ADD_LISTENER:
      return Arrays.add(state, action.listener)
    case CLEAR_LISTENERS:
      return INITIAL_CONFIG
    case NOTIFY_LISTENER:
      state.listeners.find(listener => listener.id === action.id).notify(action.notification)
      return state
    default:
      return state
  }
}

export default overlay
