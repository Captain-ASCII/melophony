import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import Playlist from '@models/Playlist'
import PlaylistManager from '@models/PlaylistManager'


import { selectPlaylistManager } from '@selectors/App'
import { selectPlaylists } from '@selectors/Playlist'

import { setPlaylistManager } from '@actions/App'

// import Card from '@components/Card'
// import ClickableTextInput from '@components/ClickableTextInput'
import IconButton from '@components/IconButton'


const PlaylistCard = ({ playlist, playlistManager, index }: { playlist: Playlist; playlistManager: PlaylistManager; index: number }): JSX.Element => {
  const dispatch = useDispatch()

  const runPlaylist = () => {
    dispatch(setPlaylistManager(playlistManager.withQueue(playlist.getTracks()).next()))
  }

  return (
    <div className="playlistCard" >
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

  const playlistManager = selectPlaylistManager()
  const playlists = selectPlaylists()

  return (
    <div id="playlistScreen" className="screen" >
      <div id="pageHeader">
        <h2 id="pageTitle">Playlists</h2>
      </div>
      <div className="itemBlocks">
        {playlists.map((playlist, index) => <PlaylistCard key={index} playlist={playlist} playlistManager={playlistManager} index={index} />)}
      </div>
      <Link to={'/playlist/create'} ><IconButton className="floating" icon="plus" /></Link>
    </div>
  )
}

export default PlaylistsScreen