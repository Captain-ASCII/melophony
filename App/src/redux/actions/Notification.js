
export const ADD_NOTIFICATION = 'ADD_NOTIFICATION'
export const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION'

export const addNotification = notification => ({ type: ADD_NOTIFICATION, notification })
export const removeNotification = notification => ({ type: REMOVE_NOTIFICATION, notification })