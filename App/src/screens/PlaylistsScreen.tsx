import React, { useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import JWT from 'jwt-client'

import Playlist from '@models/Playlist'
import PlaylistManager from '@models/PlaylistManager'

import { selectConfiguration } from '@selectors/Configuration'
import { selectApiManager, selectPlaylistManager } from '@selectors/App'
import { selectPlaylists } from '@selectors/Playlist'

import { setPlaylistManager } from '@actions/App'

import Button from '@components/Button'

import KeyboardManager from '@utils/KeyboardManager'
import { _ } from '@utils/TranslationUtils'


const PlaylistCard = ({ playlist, playlistManager, serverAddress }: { playlist: Playlist; playlistManager: PlaylistManager; serverAddress: string }): JSX.Element => {
  const dispatch = useDispatch()
  const apiManager = selectApiManager()

  const runPlaylist = () => {
    dispatch(setPlaylistManager(playlistManager.withQueue(playlist.getTracks()).next()))
  }

  const id = KeyboardManager.getId(playlist)

  useEffect(() => {
    const token = JWT.get().substring(7)
    document.getElementById(id).style.backgroundImage = `linear-gradient(rgba(0,0,0,0), rgba(0,0,0,1)), url("${serverAddress}/api/playlist/${playlist.getId()}/image?v=${Math.random()}&jwt=${token}")`
  }, [])

  return (
    <div id={id} className="playlistCard" >
      <div className="playlistInfo">
        <h5>{playlist.getName()}</h5>
        <p>{_("playlists.tracks.number", [playlist.getTracks().length]) }</p>
      </div>
      <Link to={`/modify/playlist/${playlist.getId()}`} ><Button className="floating mini" icon="pen" /></Link>
      <Button id={KeyboardManager.getClickId(playlist)} className="floating mini second" icon="play" onClick={runPlaylist} />
    </div>
  )
}


const PlaylistsScreen = (): JSX.Element => {
  const ref = useRef(null)

  const configuration = selectConfiguration()
  const playlistManager = selectPlaylistManager()
  const playlists = selectPlaylists()

  KeyboardManager.addMainNodes(playlists, {ref, withDifferentClickable: true}, 220)

  return (
    <div id="playlistScreen" className="screen" >
      <div id="pageHeader">
        <h2 id="pageTitle">Playlists</h2>
      </div>
      <div ref={ref} className="itemBlocks">
        {
          playlists.map((playlist, index) => {
            return (
              <PlaylistCard key={index} playlist={playlist} playlistManager={playlistManager}
                serverAddress={configuration.getServerAddress()} />
            )
          })
        }
      </div>
      <Link to={'/playlist/create'} ><Button className="floating" icon="plus" /></Link>
    </div>
  )
}

export default PlaylistsScreen