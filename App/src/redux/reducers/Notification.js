import { ADD_NOTIFICATION, REMOVE_NOTIFICATION } from 'actions/Notification'
import { Arrays } from 'utils/Immutable'

const notifications = (state = [], action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return Arrays.add(state, action.notification)
    case REMOVE_NOTIFICATION:
        return Arrays.remove(state, notification => notification.getId() === action.notification.getId())
    default:
      return state
  }
}

export default notifications
