import React, {} from 'react'
import PropTypes from 'prop-types'

import { selectPlaylist } from '@selectors/App'

import Track from '@models/Track'

const PlayList = ({ tracks }: { tracks: Array<Track> }): JSX.Element => {
  const rTracks = tracks.map(track => (<p key={track.getId()} className="hideWhenClosed" >{ track.getTitle() }</p>))
  const rPlaylist = selectPlaylist().getList().map(track => (<p key={track.getId()} className="hideWhenClosed" >{ track.getTitle() }</p>))

  return (
    <div className="playlist" >
      <h5 className="playlistLength" >
        <span>{ rTracks.length }</span>
        <span className="hideWhenClosed" >Track(s)</span>
      </h5>
      { rTracks }
      { rPlaylist }
    </div>
  )
}

PlayList.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.instanceOf(Track))
}

export default PlayList
