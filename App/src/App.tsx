import React, { useCallback, useState } from 'react'
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
import TracksScreen from '@screens/TracksScreen'
import UserConfigurationScreen from '@screens/UserConfigurationScreen'
import NetworkStatisticsScreen from '@screens/NetworkStatisticsScreen'

import MediaUtils from '@utils/MediaUtils'
import KeyboardManager, { AppIds } from '@utils/KeyboardManager'
import { _ } from '@utils/TranslationUtils'

import { setConfiguration } from '@actions/Configuration'
import { selectConfiguration } from '@selectors/Configuration'
import { selectApiManager, selectPlaylistManager } from '@selectors/App'

import ConfirmOverlay from '@components/ConfirmOverlay'
import Button from '@components/Button'
import NotificationToaster from '@components/NotificationToaster'
import Player from '@components/Player'
import PlayList from '@components/PlayList'
import UserDrawer from '@components/UserDrawer'
import SynchronizationScreen from '@screens/SynchronizationScreen'


const MenuLink = ({ id, title, path, icon, hideMenu }: { id: string; title: Str; path: string; icon: string; hideMenu: () => void }): JSX.Element => {
  return (
    <Link to={path} >
      <div id={id} className="menuLink buttonTitle hideWhenClosed">
        <Button icon={icon} title={title} onClick={hideMenu} />
      </div>
    </Link>
  )
}

const App = (): JSX.Element => {
  const dispatch = useDispatch()

  const configuration = selectConfiguration()
  const apiManager = selectApiManager()
  const playlist = selectPlaylistManager()
  const isAndroidWebApp = MediaUtils.isAndroidWebApp()
  const isDebugMode = MediaUtils.isDebugMode()

  const [ menuState, setMenu ] = useState(MediaUtils.isMobileScreen() ? 'closed' : 'opened')

  const handleMenuSwitch = useCallback(() => setMenu(prev => prev === 'opened' ? 'closed' : 'opened'), [ setMenu ])
  const hideMenu = useCallback(() => {
    if (MediaUtils.isMobileScreen()) {
      setMenu('closed')
    }
  }, [ setMenu ])

  const switchServerAddress = useCallback((value: string) => {
    dispatch(setConfiguration(configuration.withServerAddress(value)))
  }, [ dispatch, configuration ])

  KeyboardManager.addConstantNodes(AppIds.MENU, [AppIds.TRACKS_MENU, AppIds.PLAYLISTS_MENU, AppIds.ARTISTS_MENU], {top: AppIds.MELOPHONY, right: AppIds.MAIN_CONTENT})

  return(
    <Router>
      <div className="App">
        <div id="mainContainer">
          <div className={`sidebar left ${menuState}`} >
            <UserDrawer hideMenu={hideMenu} />
            <MenuLink id={AppIds.TRACKS_MENU} path="/tracks" title={_("sidemenu.tracks")} icon="music" hideMenu={hideMenu} />
            <MenuLink id={AppIds.PLAYLISTS_MENU} path="/playlists" title={_("sidemenu.playlists")} icon="compact-disc" hideMenu={hideMenu} />
            <MenuLink id={AppIds.ARTISTS_MENU} path="/artists" title={_("sidemenu.artists")} icon="user-friends" hideMenu={hideMenu} />
            { isDebugMode && <MenuLink id={AppIds.ARTISTS_MENU} path="/netstats" title={_("sidemenu.netstats")} icon="network-wired" hideMenu={hideMenu} /> }
            { isAndroidWebApp && <MenuLink id={AppIds.ARTISTS_MENU} path="/synchronization" title={_("sidemenu.synchronization")} icon="sync" hideMenu={hideMenu} /> }
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
              <Route path="/user" component={UserConfigurationScreen} />
              { isDebugMode && <Route path="/netstats" component={NetworkStatisticsScreen} /> }
              { isAndroidWebApp && <Route path="/synchronization" component={SynchronizationScreen} /> }
              <Route path="/*" component={TracksScreen} />
            </Switch>
          </div>
          <div className="sidebar right" >
            <div className="border" />
            <div className="content-right" />
          </div>
        </div>
        <div id="header">
          <div id="headerMenu" >
            <Button icon="bars" iconSize="2x" onClick={handleMenuSwitch} />
            <Link id={AppIds.MELOPHONY} to="/" >
              <div id="AppHeader">
                <div className="logo" >
                  <img src="/public/img/melophony.png" style={{ height: 70, width: 70 }} />
                </div>
                <h1>Melophony</h1>
              </div>
            </Link>
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