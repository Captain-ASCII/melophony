import { combineReducers, createStore } from 'redux'

import app from 'reducers/App'
import configuration from 'reducers/Configuration'
import managers from 'reducers/Managers'
import artists from 'reducers/Artist'
import tracks from 'reducers/Track'
import listeners from 'reducers/Listener'

const reducer = combineReducers({
  app,
  configuration,
  managers,
  artists,
  tracks,
  listeners
})

const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export { store, reducer }