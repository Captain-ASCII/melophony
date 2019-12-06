
import { combineReducers } from 'redux'
import configuration from 'reducers/configuration'
import media from 'reducers/media'

export const reducer = combineReducers({
  configuration,
  media
})
