import React, { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { hot } from 'react-hot-loader'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

import ArtistOverviewScreen from 'screens/ArtistOverviewScreen'
import ArtistsScreen from 'screens/ArtistsScreen'
import TrackCreationScreen from 'screens/TrackCreationScreen'
import ModificationScreen from 'screens/ModificationScreen'
import TracksScreen from 'screens/TracksScreen'

import { setApiManager } from 'actions/Managers'
import { setInConfiguration } from 'actions/Configuration'

import ApiManager from 'utils/ApiManager'
import MediaManager from 'utils/MediaManager'

import { selectApiManager } from 'selectors/Manager'

import ConfirmOverlay from 'components/utils/ConfirmOverlay'
import { ConfigurationSwitch, SwitchState } from 'components/utils/Switch'
import NotificationToaster from 'components/utils/NotificationToaster'

const App = () => {
  const dispatch = useDispatch()

  const apiManager = selectApiManager()

  useEffect(() => {
    dispatch(setApiManager(new ApiManager('http://localhost:1958')))
  }, [])

  const synchronize = useCallback(() => apiManager.get('synchronize'))

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
              <Route path="/modify" component={ModificationScreen} />
              <Route path="/track/create" component={TrackCreationScreen} />
              <Route path="/artists" component={ArtistsScreen} />
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
            <ConfigurationSwitch
              enabledState={new SwitchState('network-wired active', 'https://melophony.ddns.net')}
              disabledState={new SwitchState('network-wired', 'http://localhost:1958')}
              title="Should connect to network for data" configurationKey="serverAddress"
            />
          </div>
        </div>
        <NotificationToaster />
        <div id="footer">
          <MediaManager />
        </div>
        <ConfirmOverlay />
      </div>
    </Router>
  )
}

export default hot(module)(App)