
import { combineReducers } from 'redux'
import configuration from 'reducers/Configuration'
import managers from 'reducers/Managers'

export const reducer = combineReducers({
  configuration,
  managers
})
