import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { hot } from 'react-hot-loader'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

import ArtistModificationScreen from './screens/ArtistModificationScreen'
import ArtistOverviewScreen from './screens/ArtistOverviewScreen'
import ArtistsScreen from './screens/ArtistsScreen'
import TrackCreationScreen from './screens/TrackCreationScreen'
import TrackModificationScreen from './screens/TrackModificationScreen'
import TracksScreen from './screens/TracksScreen'

import { setApiManager, setMediaManager } from 'actions/Managers'

import ApiManager from 'utils/ApiManager'
import MediaManager from 'utils/MediaManager'

import ConfirmOverlay from './components/utils/ConfirmOverlay'
import InputRange from './components/utils/InputRange'
import { SimpleSwitch } from './components/utils/Switch'

const App = () => {
  const dispatch = useDispatch()
  const mediaManager = useSelector(state => state.managers.mediaManager)
  const apiManager = useSelector(state => state.managers.apiManager)

  useEffect(() => { 
    dispatch(setMediaManager(new MediaManager()))
    dispatch(setApiManager(new ApiManager()))
  }, [])

  const switchNetwork = useCallback((enabled) => {
    configurationManager.set('serverAddress', (enabled ? 'https://melophony.ddns.net' : 'http://localhost:1958'))
    console.warn(configurationManager.get('serverAddress'))
  })

  const synchronize = useCallback(() => apiManager.get('synchronize'))

  const getCurrentTrackUrl = useCallback(() => '/track/modify/')

  const triggerPlay = useCallback(() => mediaManager.playPause())
  const triggerPrevious = useCallback(() => mediaManager.previous())
  const triggerNext = useCallback(() => mediaManager.next())

  return(
    <Router>
      <div className="App">
        <div className="main-container">
          <div className="sidebar left" >
            <Link to="/tracks" ><div className="button">Titles</div></Link>
            <Link to="/artists" ><div className="button">Artists</div></Link>
            <div id="toaster">
              <div id="toasterText">?!</div>
            </div>
          </div>
          <div id="content">
            <Switch>
              <Route path="/tracks" component={TracksScreen} />
              <Route path="/track/modify/:id" component={TrackModificationScreen} />
              <Route path="/track/create" component={TrackCreationScreen} />
              <Route path="/artists" component={ArtistsScreen} />
              <Route path="/artist/modify/:id" component={ArtistModificationScreen} />
              <Route path="/artist/:id" component={ArtistOverviewScreen} />
              <Route path="/" exact component={TracksScreen} />
            </Switch>
          </div>
          <div className="sidebar right" >
            <div className="border" />
            <div className="content-right" />
          </div>
        </div>
        <div id="header">
          <Link to="/" >
            <div id="AppHeader">
              <div className="logo" >
                <img src="/img/melophony.png" style={{ height: '100%' }} />
              </div>
              <h1>Melophony</h1>
            </div>
          </Link>
          <div id="headerActions">
            <i onClick={synchronize} className="fa fa-download icon button" />
            <SimpleSwitch
              icon="network-wired" title="Should connect to network for data"
              configurationSwitch="networkEnabled" onSwitch={switchNetwork}
            />
          </div>
        </div>
        <div id="footer">
          <audio id="player">
            <p>If you are reading this, it is because your browser does not support the audio element.</p>
          </audio>
          <div id="controls">
            <div className="button icon" onClick={triggerPrevious} ><i className="fa fa-backward fa-2x"  /></div>
            <div className="button icon" onClick={triggerPlay} ><i id="playButton" className="fa fa-play fa-2x" tabIndex="-1"  /></div>
            <div className="button icon" onClick={triggerNext} ><i className="fa fa-forward fa-2x"  /></div>
          </div>
          <Link to={getCurrentTrackUrl} id="currentTrackInfoLink" >
            <div id="currentTrackInfo"  />
          </Link>
          <InputRange asReader />
        </div>
        <ConfirmOverlay />
      </div>
    </Router>
  )
}

export default hot(module)(App)