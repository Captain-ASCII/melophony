
export const CLEAR_NOTIFICATION = 'CLEAR_NOTIFICATION'
export const NOTIFY_LISTENER = 'NOTIFY_LISTENER'

export const notifyListener = (id, notification) => ({ type: NOTIFY_LISTENER, id, notification })
export const clearNotification = id => ({ type: CLEAR_NOTIFICATION, id })
