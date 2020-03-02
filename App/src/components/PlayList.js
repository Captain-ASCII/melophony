import React, {} from 'react'
import PropTypes from 'prop-types'

import Track from 'models/Track'

const PlayList = ({ tracks }) => {
const rTracks = tracks.map(track => (<p key={track.getId()} className="hideWhenClosed" >{ track.getTitle() }</p>))

  return (
    <div className="playlist" >
      <h3 className="playlistLength" >
        <span>{ rTracks.length }</span>
        <span className="hideWhenClosed" >Track(s)</span>
      </h3>
      { rTracks }
    </div>
  )
}

PlayList.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.instanceOf(Track))
}

export default PlayList
