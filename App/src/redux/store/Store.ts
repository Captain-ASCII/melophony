import { combineReducers, createStore, compose } from 'redux'

import app from '@reducers/App'
import artists from '@reducers/Artist'
import configuration from '@reducers/Configuration'
import listeners from '@reducers/Event'
import notifications from '@reducers/Notification'
import tracks from '@reducers/Track'
import files from '@reducers/File'
import playlists from '@reducers/Playlist'

const reducer = combineReducers({
  app,
  artists,
  configuration,
  listeners,
  notifications,
  tracks,
  files,
  playlists,
})

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducer, composeEnhancers())

export { store, reducer }

export type RootState = ReturnType<typeof reducer>