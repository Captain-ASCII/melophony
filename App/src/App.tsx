import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { hot } from 'react-hot-loader'

import ArtistModificationScreen from '@screens/ArtistModificationScreen'
import ArtistOverviewScreen from '@screens/ArtistOverviewScreen'
import ArtistsScreen from '@screens/ArtistsScreen'
import TrackCreationScreen from '@screens/TrackCreationScreen'
import TrackModificationScreen from '@screens/TrackModificationScreen'
import TracksScreen from '@screens/TracksScreen'

import { setApiManager } from '@actions/App'

import ApiManager from '@utils/ApiManager'
import Player from '@components/Player'

import { selectApiManager } from '@selectors/App'
import { selectConfiguration } from '@selectors/Configuration'
import { selectPlaylist } from '@selectors/App'

import { setConfiguration } from '@actions/Configuration'
import ConfirmOverlay from '@components/ConfirmOverlay'
import NotificationToaster from '@components/NotificationToaster'
import PlayList from '@components/PlayList'
import RSwitch, { SwitchState } from '@components/Switch'


const MenuLink = ({ title, path, icon }: { title: string; path: string; icon: string }): JSX.Element => {
  return (
    <Link to={path} >
      <div className="menuLink button" >
        <i className={`fa fa-${icon}`} />
        <p className="buttonTitle hideWhenClosed" >{ title }</p>
      </div>
    </Link>
  )
}



const App = (): JSX.Element => {
  const dispatch = useDispatch()

  const configuration = selectConfiguration()
  const apiManager = selectApiManager()
  const playlist = selectPlaylist()

  const [ menuState, setMenu ] = useState('closed')

  const synchronize = useCallback(() => apiManager.get('synchronize'), [ apiManager ])

  const handleMenuSwitch = useCallback(() => setMenu(prev => prev === 'opened' ? 'closed' : 'opened'), [])

  const switchServerAddress = useCallback((value: string) => {
    dispatch(setConfiguration(configuration.withServerAddress(value)))
  }, [ dispatch, configuration ])

  return(
    <Router>
      <div className="App">
        <div className="main-container">
          <div className={`sidebar left ${menuState}`} >
            <MenuLink path="/tracks" title="Tracks" icon="music" />
            <MenuLink path="/artists" title="Artists" icon="user-friends" />
            <div id="mainPlaylist" >
              <PlayList tracks={playlist.getQueue()} />
            </div>
          </div>
          <div id="content">
            <Switch>
              <Route path="/tracks" component={TracksScreen} />
              <Route path="/track/create" component={TrackCreationScreen} />
              <Route path="/artists" component={ArtistsScreen} />
              <Route path="/artist/:id" component={ArtistOverviewScreen} />
              <Route path="/" exact component={TracksScreen} />
              <Route path="/modify/artist/:id" component={ArtistModificationScreen} />
              <Route path="/modify/track/:id" component={TrackModificationScreen} />
            </Switch>
          </div>
          <div className="sidebar right" >
            <div className="border" />
            <div className="content-right" />
          </div>
        </div>
        <div id="header">
          <div id="headerMenu" >
            <i id="menu" className="fa fa-bars fa-2x icon button" onClick={handleMenuSwitch} />
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
            <RSwitch
              initial={configuration.getServerAddress()}
              enabledState={new SwitchState('network-wired active', 'https://melophony.ddns.net')}
              disabledState={new SwitchState('network-wired', 'http://localhost:1958')}
              title="Should connect to network for data" onSwitch={switchServerAddress}
            />
          </div>
        </div>
        <NotificationToaster />
        <div id="footer">
          <Player />
        </div>
        <ConfirmOverlay />
      </div>
    </Router>
  )
}

export default hot(module)(App)