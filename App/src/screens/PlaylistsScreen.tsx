import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import JWT from 'jwt-client'

import Playlist from '@models/Playlist'
import PlaylistManager from '@models/PlaylistManager'

import { selectConfiguration } from '@selectors/Configuration'
import { selectPlaylistManager } from '@selectors/App'
import { selectPlaylists } from '@selectors/Playlist'

import { setPlaylistManager } from '@actions/App'

// import Card from '@components/Card'
// import ClickableTextInput from '@components/ClickableTextInput'
import IconButton from '@components/IconButton'


const PlaylistCard = ({ playlist, playlistManager, serverAddress }: { playlist: Playlist; playlistManager: PlaylistManager; serverAddress: string }): JSX.Element => {
  const dispatch = useDispatch()

  const runPlaylist = () => {
    dispatch(setPlaylistManager(playlistManager.withQueue(playlist.getTracks()).next()))
  }

  const imageBackground = playlist.getImageName() != null
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,1)), url(${serverAddress}/playlist/image/${playlist.getImageName()}?jwt=${JWT.get()})`}
    : {}

  return (
    <div className="playlistCard" style={imageBackground} >
      <div className="playlistInfo">
        <h5>{playlist.getName()}</h5>
        <p>{playlist.getTracks().length} tracks</p>
      </div>
      <Link to={`/modify/playlist/${playlist.getId()}`} ><IconButton className="floating mini" icon="pen" /></Link>
      <IconButton className="floating mini second" icon="play" onClick={runPlaylist} />
    </div>
  )
}



const PlaylistsScreen = (): JSX.Element => {

  const configuration = selectConfiguration()
  const playlistManager = selectPlaylistManager()
  const playlists = selectPlaylists()

  return (
    <div id="playlistScreen" className="screen" >
      <div id="pageHeader">
        <h2 id="pageTitle">Playlists</h2>
      </div>
      <div className="itemBlocks">
        {
          playlists.map((playlist, index) => {
            return (
              <PlaylistCard key={index} playlist={playlist} playlistManager={playlistManager}
                serverAddress={configuration.getServerAddress()} />
            )
          })
        }
      </div>
      <Link to={'/playlist/create'} ><IconButton className="floating" icon="plus" /></Link>
    </div>
  )
}

export default PlaylistsScreen