import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import { selectPlaylist } from 'selectors/App'
import { setCurrentTrack, setPlaylist } from 'actions/App'

import Track from 'models/Track'

const stopPropagation = e => e.stopPropagation()

const formatDuration = (duration) => {
  let minutes = '0' + Math.round(duration / 60)
  let seconds = '0' + (duration % 60)
  return `${minutes.substr(-2)} : ${seconds.substr(-2)}`
}

const RTrack = ({ track, hasScrolled, displayType }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const playlist = selectPlaylist()

  const startPlay = useCallback(() => {
    dispatch(setCurrentTrack(track))
  })

  let buttonPressTimer = null

  const press = useCallback(() => {
    buttonPressTimer = setTimeout(() => {
      if (!hasScrolled()) {
        history.push(`/track/modify/${track.getId()}`)
      }
    }, 500)
  })

  const release = useCallback(() => clearTimeout(buttonPressTimer))

  const handleEnqueue = useCallback(() => dispatch(setPlaylist(playlist.enqueue(track))))

  return (
    <div className="itemInfo" >
      <div
        className="subItemInfo" onClick={startPlay}
        onTouchStart={press} onTouchEnd={release}
      >
        <p className="title " >{track.getTitle()}</p>
      </div>
      <Link to={`/artist/${track.getArtistId()}`} onClick={stopPropagation}>
        <p className="artist" >{track.getArtistName()}</p>
      </Link>
      <div id={`${track.getVideoId()}Progress`} className={displayType == 'itemList' ? 'progressBar' : ''}  />
      <p className="duration" >{formatDuration(track.getDuration())}</p>
      <div className="itemActions">
        <i className="fa fa-plus-square icon button" onClick={handleEnqueue} />
        <Link to={`/modify/track/${track.getId()}`} ><i className="fa fa-pen icon button" /></Link>
      </div>
    </div>
  )
}

RTrack.propTypes = {
  track: PropTypes.instanceOf(Track),
  hasScrolled: PropTypes.func.isRequired,
  displayType: PropTypes.string,
}





const TrackList = ({ tracks, displayType }) => {

  let hasScrolled = false
  let scrollTimeout = null

  const scroll = useCallback(() => {
    hasScrolled = true
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    scrollTimeout = setTimeout(() => hasScrolled = false, 1000)
  })
  const getScrollStatus = useCallback(() => hasScrolled)

  return (
    <div id={displayType} onScroll={scroll} >
      {
        tracks.map((track) => {
          let blockStyle = {}

          if (displayType == 'itemBlocks') {
            // blockStyle = { backgroundImage: `url(${track.imageSrc.uri})` }
          }

          return (
            <div className="trackListItem" key={track.getId()} >
              <div className="ratioContainer" >
                <div className="blockBackground" style={blockStyle} />
                <div className="stretchBox" >
                  <RTrack
                    track={track} hasScrolled={getScrollStatus}
                    displayType={displayType}
                  />
                </div>
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

TrackList.propTypes = {
  tracks: PropTypes.arrayOf(PropTypes.instanceOf(Track)),
  displayType: PropTypes.string.isRequired,
}

export default TrackList