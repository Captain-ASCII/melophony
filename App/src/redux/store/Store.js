import { combineReducers, createStore } from 'redux'

import app from 'reducers/App'
import artists from 'reducers/Artist'
import configuration from 'reducers/Configuration'
import listeners from 'reducers/Listener'
import managers from 'reducers/Managers'
import notifications from 'reducers/Notification'
import tracks from 'reducers/Track'

const reducer = combineReducers({
  app,
  artists,
  configuration,
  listeners,
  managers,
  notifications,
  tracks,
})

const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export { store, reducer }