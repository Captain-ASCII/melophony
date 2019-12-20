import { combineReducers, createStore } from 'redux'

import configuration from 'reducers/Configuration'
import managers from 'reducers/Managers'
import artists from 'reducers/Artist'
import tracks from 'reducers/Track'

const reducer = combineReducers({
  configuration,
  managers,
  artists,
  tracks
})

const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

export { store, reducer }