import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom'
import { hot } from 'react-hot-loader'

import ArtistModificationScreen from '@screens/ArtistModificationScreen'
import ArtistCreationScreen from '@screens/ArtistCreationScreen'
import ArtistOverviewScreen from '@screens/ArtistOverviewScreen'
import ArtistsScreen from '@screens/ArtistsScreen'
import PlaylistsScreen from '@screens/PlaylistsScreen'
import PlaylistModificationScreen from '@screens/PlaylistModificationScreen'
import TrackCreationScreen from '@screens/TrackCreationScreen'
import TrackModificationScreen from '@screens/TrackModificationScreen'
import TrackSharingScreen from '@screens/TrackSharingScreen'
import TracksScreen from '@screens/TracksScreen'

import MediaUtils from '@utils/MediaUtils'

import { setConfiguration } from '@actions/Configuration'
import { selectApiManager } from '@selectors/App'
import { selectConfiguration } from '@selectors/Configuration'
import { selectPlaylistManager } from '@selectors/App'

import Button from '@components/Button'
import ConfirmOverlay from '@components/ConfirmOverlay'
import IconButton from '@components/IconButton'
import NotificationToaster from '@components/NotificationToaster'
import Player from '@components/Player'
import PlayList from '@components/PlayList'
import RSwitch, { SwitchState } from '@components/Switch'
import UserDrawer from '@components/UserDrawer'


const MenuLink = ({ title, path, icon }: { title: string; path: string; icon: string }): JSX.Element => {
  return (
    <Link to={path} >
      <div className="menuLink buttonTitle hideWhenClosed">
        <Button icon={icon} title={title} onClick={() => {}} />
      </div>
    </Link>
  )
}



const App = (): JSX.Element => {
  const dispatch = useDispatch()

  const configuration = selectConfiguration()
  const apiManager = selectApiManager()
  const playlist = selectPlaylistManager()

  const [ menuState, setMenu ] = useState(MediaUtils.isMobileScreen() ? 'closed' : 'opened')

  const synchronize = useCallback(() => apiManager.get('synchronize'), [ apiManager ])

  const handleMenuSwitch = useCallback(() => setMenu(prev => prev === 'opened' ? 'closed' : 'opened'), [ setMenu ])

  const switchServerAddress = useCallback((value: string) => {
    dispatch(setConfiguration(configuration.withServerAddress(value)))
  }, [ dispatch, configuration ])

  return(
    <Router>
      <div className="App">
        <div className="main-container">
          <div className={`sidebar left ${menuState}`} >
            <UserDrawer />
            <MenuLink path="/tracksharing" title="Music sharing" icon="share-alt" />
            <MenuLink path="/tracks" title="Tracks" icon="music" />
            <MenuLink path="/playlists" title="Playlists" icon="compact-disc" />
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
              <Route path="/artist/create" component={ArtistCreationScreen} />
              <Route path="/artist/:id" component={ArtistOverviewScreen} />
              <Route path="/playlists" component={PlaylistsScreen} />
              <Route path="/playlist/create" component={PlaylistModificationScreen} />
              <Route path="/modify/artist/:id" component={ArtistModificationScreen} />
              <Route path="/modify/track/:id" component={TrackModificationScreen} />
              <Route path="/modify/playlist/:id" component={PlaylistModificationScreen} />
              <Route path="/tracksharing" component={TrackSharingScreen} />
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
            <IconButton onClick={synchronize} icon="download" />
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