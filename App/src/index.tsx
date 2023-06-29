
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
import Playlist from '@models/Playlist'
import User from '@models/User'

import Notification from '@models/Notification'
import PlaylistManager from '@models/PlaylistManager'

import LoginScreen from '@screens/LoginScreen'
import SplashScreen from '@screens/SplashScreen'

import { addNotification } from '@actions/Notification'
import { setArtists } from '@actions/Artist'
import { setPlaylistManager, setUser } from '@actions/App'
import { setTracks } from '@actions/Track'
import { setPlaylists } from '@actions/Playlist'

import ApiManager from '@utils/ApiManager'
import KeyboardManager from '@utils/KeyboardManager'
import MediaManager from '@utils/MediaManager'
import TokenManager from '@utils/TokenManager'
import { getLanguage } from '@utils/TranslationUtils'

const configuration = store.getState().configuration

const baseApiManager = new ApiManager(
  configuration.getServerAddress(),
  ([status, data, message]: [number, any, string]) => {
    if (message != null) {
      store.dispatch(addNotification(new Notification(message)))
    }
    return data
  },
  new TokenManager(() => {
    JWT.forget()
    init()
  })
)

store.getState().app.apiManager = baseApiManager
store.getState().app.playlist = new PlaylistManager([], false)
store.getState().app.mediaManager = new MediaManager()
store.getState().app.keyboardManager = new KeyboardManager(configuration.isKeyboardNavEnabled())
store.getState().app.language = getLanguage(configuration.getLanguage())

async function getData(apiManager: ApiManager, userId: number): Promise<void> {

  const tracksResponse = await apiManager.get('/tracks')
  const playlistsResponse = await apiManager.get('/playlists')
  const artistsResponse = await apiManager.get('/artists')
  const userResponse = await apiManager.get(`/user/${userId}`)

  const tracks = tracksResponse[1].map((track: any) => Track.fromObject(track))
  const playlists = playlistsResponse[1].map((playlist: any) => Playlist.fromObject(playlist))
  const artists = artistsResponse[1].map((artist: any) => Artist.fromObject(artist))
  const user = User.fromObject(userResponse[1])

  store.dispatch(setArtists(artists))
  store.dispatch(setTracks(tracks))
  store.dispatch(setPlaylists(playlists))
  store.dispatch(setPlaylistManager(new PlaylistManager(tracks, configuration.getShuffleMode())))
  store.dispatch(setUser(user))

  ReactDOM.render(
    <Provider store={store} >
      <App />
    </Provider>,
    document.getElementById('root')
  )
}

function renderLoginScreen() {
  JWT.forget()
  ReactDOM.render(
    <Provider store={store} >
      <LoginScreen getRequiredData={getData} />
    </Provider>,
    document.getElementById('root')
  )
}

async function tryAuthentication(apiManager: ApiManager): Promise<void> {
  const currentToken = JWT.get()
  console.warn(currentToken)
  if (currentToken !== null) {
    const userData = JWT.read(currentToken)
    apiManager.get(`/user/${userData.claim.user.id}`).then(response => {
      if (response[0] != 200) {
        renderLoginScreen()
      } else {
        getData(apiManager, userData.claim.user.id)
      }
    })
  } else {
    renderLoginScreen()
  }
}

async function init(): Promise<void> {
  ReactDOM.render(
    <Provider store={store} >
      <SplashScreen onNetworkConfiguration={tryAuthentication} />
    </Provider>,
    document.getElementById('root')
  )
  tryAuthentication(baseApiManager)
}

export { init }

init()