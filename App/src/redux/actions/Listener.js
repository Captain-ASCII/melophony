
export const ADD_LISTENER = 'ADD_LISTENER'
export const CLEAR_LISTENERS = 'CLEAR_LISTENERS'
export const NOTIFY_LISTENER = 'NOTIFY_LISTENER'

export const addListener = listener => ({ type: ADD_LISTENER, listener })
export const clearListeners = () => ({ type: CLEAR_LISTENERS })
export const notifyListener = (id, notification) => ({ type: NOTIFY_LISTENER, id, notification })
