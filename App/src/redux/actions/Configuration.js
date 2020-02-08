
export const SET_CONFIGURATION = 'SET_CONFIGURATION'
export const SET_CONFIGURATION_VALUE = 'SET_CONFIGURATION_VALUE'

export const setConfiguration = configuration => ({ type: SET_CONFIGURATION, configuration })
export const setInConfiguration = (key, value) => ({ type: SET_CONFIGURATION_VALUE, key, value })