
export const SET_CONFIGURATION = 'SET_CONFIGURATION'
export const SET_IN_CONFIGURATION = 'SET_IN_CONFIGURATION'

export const setConfiguration = configuration => ({ type: SET_CONFIGURATION, configuration })
export const setInConfiguration = (key, value) => ({ type: SET_IN_CONFIGURATION, key, value })
