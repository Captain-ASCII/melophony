import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'public/css/App.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { store } from 'store'
import App from 'app'

import Track from 'models/Track'
import Artist from 'models/Artist'

import Playlist from 'utils/Playlist'

import SplashScreen from 'screens/SplashScreen'

import { setPlaylist } from 'actions/App'
import { setTracks } from 'actions/Track'
import { setArtists } from 'actions/Artist'

async function getData() {
  const configuration = store.getState().configuration

  const tracksJson = await (await fetch(`${configuration['serverAddress']}/tracks`)).json()
  const artistsJson = await (await fetch(`${configuration['serverAddress']}/artists`)).json()

  const tracks = Object.values(tracksJson).map(track => Track.fromObject(track, Object.values(artistsJson)))
  const artists = Object.values(artistsJson).map(artist => Artist.fromObject(artist))

  store.dispatch(setArtists(artists))
  store.dispatch(setTracks(tracks))
  store.dispatch(setPlaylist(new Playlist(tracks)))

  ReactDOM.render(
    <Provider store={store} >
      <App />
    </Provider>,
    document.getElementById('root')
  )
}

ReactDOM.render(
  <Provider store={store} >
    <SplashScreen getRequiredData={getData} />
  </Provider>,
  document.getElementById('root')
)

getData()
