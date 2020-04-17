import { ADD_NOTIFICATION, REMOVE_NOTIFICATION, NotificationAction } from '@actions/Notification'

import Notification from '@models/Notification'

import { Arrays } from '@utils/Immutable'

const notifications = (state: Array<Notification> = [], action: NotificationAction): Array<Notification> => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return Arrays.add(state, action.notification)
    case REMOVE_NOTIFICATION:
        return Arrays.remove(state, (notification: Notification): boolean => notification.getId() === action.notification.getId())
    default:
      return state
  }
}

export default notifications
