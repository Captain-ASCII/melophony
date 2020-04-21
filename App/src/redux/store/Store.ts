import { combineReducers, createStore, compose } from 'redux'

import app from '@reducers/App'
import artists from '@reducers/Artist'
import configuration from '@reducers/Configuration'
import notifications from '@reducers/Notification'
import tracks from '@reducers/Track'
import listeners from '@reducers/Event'

// import Playlist from '@models/Playlist'
// import Artist from '@models/Artist'
// import Configuration from '@models/Configuration'
// import Manager from '@models/Manager'
// import Notification from '@models/Notification'
// import Track from '@models/Track'

// interface RootState {
//   playlists: Array<Playlist>;
//   artists: Array<Artist>;
//   configuration: Configuration;
//   managers: Array<Manager>;
//   notifications: Array<Notification>;
//   tracks: Array<Track>;
// }

const reducer = combineReducers({
  app,
  artists,
  configuration,
//   listeners,
  notifications,
  tracks,
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