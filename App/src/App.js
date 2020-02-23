import React, { useCallback, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'

import { hot } from 'react-hot-loader'
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'

import ArtistOverviewScreen from 'screens/ArtistOverviewScreen'
import ArtistsScreen from 'screens/ArtistsScreen'
import TrackCreationScreen from 'screens/TrackCreationScreen'
import ModificationScreen from 'screens/ModificationScreen'
import TracksScreen from 'screens/TracksScreen'

import { setApiManager } from 'actions/Managers'

import ApiManager from 'utils/ApiManager'
import MediaManager from 'utils/MediaManager'

import { selectApiManager } from 'selectors/Manager'
import { selectConfiguration } from 'selectors/Configuration'

import ConfirmOverlay from 'components/ConfirmOverlay'
import { ConfigurationSwitch, SwitchState } from 'components/Switch'
import NotificationToaster from 'components/NotificationToaster'


const MenuLink = ({ title, path, icon }) => {
  return (
    <Link to={path} >
      <div className="menuLink button" >
        <i className={`fa fa-${icon}`} />
        <p className="buttonTitle" >{ title }</p>
      </div>
    </Link>
  )
}

MenuLink.propTypes = {
  title: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
}




const App = () => {
  const dispatch = useDispatch()

  const configuration = selectConfiguration()
  const apiManager = selectApiManager()

  const [ menuState, setMenu ] = useState('closed')

  useEffect(() => {
    dispatch(setApiManager(new ApiManager(configuration['serverAddress'])))
  }, [])

  const synchronize = useCallback(() => apiManager.get('synchronize'))

  const handleMenuSwitch = useCallback(() => setMenu(prev => prev === 'opened' ? 'closed' : 'opened'))

  return(
    <Router>
      <div className="App">
        <div className="main-container">
          <div className={`sidebar left ${menuState}`} >
            <MenuLink path="/tracks" title="Tracks" icon="music" />
            <MenuLink path="/artists" title="Artists" icon="user-friends" />
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
          <div id="headerMenu" >
            <i className="fa fa-bars fa-2x icon button" onClick={handleMenuSwitch} />
            <Link to="/" >
              <div id="AppHeader">
                <div className="logo" >
                  <img src="/img/melophony.png" style={{ height: '100%' }} />
                </div>
                <h1>Melophony</h1>
              </div>
            </Link>
          </div>
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