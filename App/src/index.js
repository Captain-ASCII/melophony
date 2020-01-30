import 'core-js/stable'
import 'regenerator-runtime/runtime'
import 'public/css/App.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import { store } from 'store'
import App from './App.js'

import Track from 'models/Track'
import Artist from 'models/Artist'

import SplashScreen from './screens/SplashScreen.js'

import ApiManager from './utils/ApiManager'
import ConfigurationManager from './utils/ConfigurationManager'
import DataStorage from './utils/DataStorage'

import { setTracks } from 'actions/Track'
import { setArtists } from 'actions/Artist'

global.apiManager = new ApiManager('http://localhost:1958')
global.configurationManager = new ConfigurationManager()
global.dataStorage = new DataStorage()

async function getData() {
  let tracks = await (await fetch(`${global.configurationManager.get('serverAddress')}/tracks`)).json()
  let artists = await (await fetch(`${global.configurationManager.get('serverAddress')}/artists`)).json()

  global.dataStorage.set('/tracks', tracks)
  global.dataStorage.set('/artists', artists)

  store.dispatch(setArtists(Object.values(artists).map(artist => Artist.fromObject(artist))))
  store.dispatch(setTracks(Object.values(tracks).map(track => Track.fromObject(track, Object.values(artists)))))

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
