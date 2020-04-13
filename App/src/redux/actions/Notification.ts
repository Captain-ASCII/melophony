
import Notification from '@models/Notification'

export const ADD_NOTIFICATION = 'ADD_NOTIFICATION'
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION'

interface AddNotificationAction {
  type: typeof ADD_NOTIFICATION;
  notification: Notification;
}

interface RemoveNotificationAction {
  type: typeof REMOVE_NOTIFICATION;
  notification: Notification;
}

export const addNotification = (notification: Notification): AddNotificationAction => ({ type: ADD_NOTIFICATION, notification })
export const removeNotification = (notification: Notification): RemoveNotificationAction => ({ type: REMOVE_NOTIFICATION, notification })

export type NotificationAction = AddNotificationAction | RemoveNotificationAction