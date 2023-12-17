
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import React from 'react'
import ReactDOM from 'react-dom'
import JWT from 'jwt-client'
import { Provider } from 'react-redux'
import { toast } from 'react-toastify'

import App from './App'

import { store } from '@store'

import Artist from '@models/Artist'
import Track from '@models/Track'
import Playlist from '@models/Playlist'
import User from '@models/User'
import File from '@models/File'

import PlaylistManager from '@models/PlaylistManager'

import LoginScreen from '@screens/LoginScreen'
import SplashScreen from '@screens/SplashScreen'

import { setConfiguration } from '@actions/Configuration'
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
  ([status, data, headers]: [number, any, Headers]) => data,
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

export function handleAndroidCommand(action: string) {
  console.log(`New android command: ${action}`)
  store.getState().app.mediaManager.handleCommand(action)
}

async function getServerData(apiManager: ApiManager) {
  const tracksResponse = await apiManager.get('/track')
  const playlistsResponse = await apiManager.get('/playlist')
  const artistsResponse = await apiManager.get('/artist')
  const filesResponse = await apiManager.get('/file')
  const keysResponse = await apiManager.get('/keys')

  const artistsArray: Array<any> = artistsResponse[1]
  const filesArray: Array<any> = filesResponse[1]
  const tracksArray: Array<any> = tracksResponse[1]
  const playlistsArray: Array<any> = playlistsResponse[1]
  const keys = keysResponse[1]

  const artists = artistsArray.reduce((map, artist: any) => {
     map.set(artist.id, Artist.fromObject(artist))
     return map
  }, new Map())
  const files = filesArray.reduce((map, file: any) => {
     map.set(file.id, File.fromObject(file))
     return map
  }, new Map())
  const tracks = tracksArray.reduce((map, track: any) => {
     map.set(track.id, Track.fromObject(track, artists, files))
     return map
  }, new Map())
  const playlists = playlistsArray.reduce((map, playlist: any) => {
     map.set(playlist.id, Playlist.fromObject(playlist, tracks))
     return map
  }, new Map())

  store.dispatch(setArtists(Array.from(artists.values())))
  store.dispatch(setTracks(Array.from(tracks.values())))
  store.dispatch(setPlaylists(Array.from(playlists.values())))
  store.dispatch(setPlaylistManager(new PlaylistManager(Array.from(tracks.values()), configuration.getShuffleMode())))
  store.dispatch(setConfiguration(configuration.withKeys(keys)))
}

async function getData(apiManager: ApiManager, userId: number): Promise<void> {

  const userResponse = await apiManager.get(`/user/${userId}`)
  const user = User.fromObject(userResponse[1])
  store.dispatch(setUser(user))

  await getServerData(apiManager)

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

export { init, getServerData }

init()