
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import React from 'react'
import ReactDOM from 'react-dom'
import JWT from 'jwt-client'
import { Provider } from 'react-redux'

import App from './App'

import { store } from '@store'

import Artist from '@models/Artist'
import Track from '@models/Track'
import User from '@models/User'

import Notification from '@models/Notification'
import PlaylistManager from '@models/PlaylistManager'

import LoginScreen from '@screens/LoginScreen'
import SplashScreen from '@screens/SplashScreen'

import { addNotification } from '@actions/Notification'
import { setArtists } from '@actions/Artist'
import { setPlaylist, setUser } from '@actions/App'
import { setTracks } from '@actions/Track'

import ApiManager, { RequestCustomizer } from '@utils/ApiManager'
import MediaManager from '@utils/MediaManager'
import TokenManager from '@utils/TokenManager'

const configuration = store.getState().configuration

const apiManager = new ApiManager(configuration.getServerAddress(), new TokenManager(() => {
  JWT.forget()
  init()
}))

RequestCustomizer.setDefault(new RequestCustomizer((code: number, body: any) => {
  store.dispatch(addNotification(new Notification(body.message)))
}))

store.getState().app.apiManager = apiManager
store.getState().app.playlist = new PlaylistManager([], false)
store.getState().app.mediaManager = new MediaManager()

async function getData(): Promise<void> {

  const tracksResponse = await apiManager.get('/tracks')
  const artistsResponse = await apiManager.get('/artists')
  const userResponse = await apiManager.get('/user')

  const tracks = tracksResponse[1].map((track: any) => Track.fromObject(track))
  const artists = artistsResponse[1].map((artist: any) => Artist.fromObject(artist))
  const user = User.fromObject(userResponse[1])

  store.dispatch(setArtists(artists))
  store.dispatch(setTracks(tracks))
  store.dispatch(setPlaylist(new PlaylistManager(tracks, configuration.getShuffleMode())))
  store.dispatch(setUser(user))

  ReactDOM.render(
    <Provider store={store} >
      <App />
    </Provider>,
    document.getElementById('root')
  )
}

async function tryAuthentication(): Promise<void> {
  apiManager.get('/user').then(response => {
    if (response[0] != 200) {
      JWT.forget()
      ReactDOM.render(
        <Provider store={store} >
          <LoginScreen getRequiredData={getData} />
        </Provider>,
        document.getElementById('root')
      )
    } else {
      getData()
    }
  })
}

async function init(): Promise<void> {
  ReactDOM.render(
    <Provider store={store} >
      <SplashScreen getRequiredData={getData} />
    </Provider>,
    document.getElementById('root')
  )
  tryAuthentication()
}

export { init }

init()