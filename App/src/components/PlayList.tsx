import React, {} from 'react'
import PropTypes from 'prop-types'

import { selectPlaylistManager } from '@selectors/App'

import Track from '@models/Track'

const PlayList = ({ tracks }: { tracks: Array<Track> }): JSX.Element => {
  const rTracks = tracks.map((track, index) => (
    <p key={`${track.getId()}_${index}`} className="hideWhenClosed" >{ track.getTitle() }</p>
  ))
  const rPlaylist = selectPlaylistManager().getList().map(track => (<p key={track.getId()} className="hideWhenClosed" >{ track.getTitle() }</p>))

  const renderPlaylist = () => {
    return (
      <>
        <h5 className="playlistLength" >Playlist</h5>
        <h5 className="playlistLength" >
          <span>{ rTracks.length }</span>
          <span className="hideWhenClosed" >Track(s)</span>
        </h5>
        { rTracks }
      </>
    )
  }

  const renderNextTracks = () => {
    return (
      <>
        <h5 className="playlistLength hideWhenClosed">Next songs</h5>
        { rPlaylist }
      </>
    )
  }

  return (
    <div className="playlist" >
      { rTracks.length > 0 ? renderPlaylist() : renderNextTracks() }
    </div>
  )
}

PlayList.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.instanceOf(Track))
}

export default PlayList
