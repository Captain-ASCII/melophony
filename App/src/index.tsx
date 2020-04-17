
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import '../public/css/App.css'

import React from 'react'
import ReactDOM from 'react-dom'
import JWT from 'jwt-client'
import { Provider } from 'react-redux'

import App from './App'

import { store } from '@store'

import Track from '@models/Track'
import Artist from '@models/Artist'

import PlaylistManager from '@models/PlaylistManager'

import LoginScreen from '@screens/LoginScreen'
import SplashScreen from '@screens/SplashScreen'

import { setPlaylist } from '@actions/App'
import { setTracks } from '@actions/Track'
import { setArtists } from '@actions/Artist'

import ApiManager from '@utils/ApiManager'
import MediaManager from '@utils/MediaManager'

const configuration = store.getState().configuration

const apiManager = new ApiManager(configuration.getServerAddress(), true)
store.getState().app.apiManager = apiManager
store.getState().app.playlist = new PlaylistManager([])
store.getState().app.mediaManager = new MediaManager()

async function getData(): Promise<void> {

  const tracksResponse = await apiManager.get('/tracks', () => false)
  const artistsResponse = await apiManager.get('/artists', () => false)

  const tracks = tracksResponse[1].data.map((track: any) => Track.fromObject(track))
  const artists = artistsResponse[1].data.map((artist: any) => new Artist(artist.id, artist.name))

  store.dispatch(setArtists(artists))
  store.dispatch(setTracks(tracks))
  store.dispatch(setPlaylist(new PlaylistManager(tracks)))

  ReactDOM.render(
    <Provider store={store} >
      <App />
    </Provider>,
    document.getElementById('root')
  )
}

async function init(): Promise<void> {
  if (JWT.get() &&  (await apiManager.get('/user', () => false))[0] != 400) {
    ReactDOM.render(
      <Provider store={store} >
        <SplashScreen getRequiredData={getData} />
      </Provider>,
      document.getElementById('root')
    )
    getData()
  } else {
    JWT.forget()
    ReactDOM.render(
      <Provider store={store} >
        <LoginScreen getRequiredData={getData} />
      </Provider>,
      document.getElementById('root')
    )
  }
}

init()