import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import MediaManager from '../../utils/MediaManager'

const stopPropagation = e => e.stopPropagation()

const formatDuration = (duration) => {
  let minutes = '0' + Math.round(duration / 60)
  let seconds = '0' + (duration % 60)
  return `${minutes.substr(-2)} : ${seconds.substr(-2)}`
}

const Track = ({ mediaManager, track, index, hasScrolled, displayType, withArtist }) => {
  const history = useHistory()

  const startPlay = useCallback(() => mediaManager.startPlay(track.id, index))
  
  let buttonPressTimer = null
    
  const press = useCallback(() => {
    buttonPressTimer = setTimeout(() => {
      if (!hasScrolled()) {
        history.push(`/track/modify/${track.id}`)
      }
    }, 500)
  })
  
  const release = useCallback(() => clearTimeout(buttonPressTimer))
  
  return (
    <div
      className="itemInfo"
      onClick={startPlay} onTouchStart={press} onTouchEnd={release}
    >
      <p className="title " >{ track.title }</p>
      { withArtist ?
            (<Link to={`/artist/${ track.artist }`} onClick={stopPropagation}>
              <p className="artist" >{ track.artistName }</p>
            </Link>) : null
          }
      <div id={`${ track.videoId }Progress`} className={displayType == 'itemList' ? 'progressBar' : ''} >
        <div /> <p />
      </div>
      <p className="duration" >{formatDuration(track.duration)}</p>
    </div>
  )
}

Track.propTypes = {
  mediaManager: PropTypes.instanceOf(MediaManager),
  // track: PropTypes.instanceOf(Track),
  index: PropTypes.number.isRequired,
  hasScrolled: PropTypes.func.isRequired,
  displayType: PropTypes.string.isRequired,
  withArtist: PropTypes.bool.isRequired,
}

const TrackList = ({ tracks, displayType, withArtist }) => {
  let hasScrolled = false
  let scrollTimeout = null

  const mediaManager = useSelector(state => state.managers.mediaManager)

  const scroll = useCallback(() => {
    hasScrolled = true
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    scrollTimeout = setTimeout(() => hasScrolled = false, 1000)
  })
  const getScrollStatus = useCallback(() => hasScrolled)

  let artists = global.dataStorage.get('artists')
  
  let tracksCopy = tracks.map(track => { return { ...track } })
  for (let track of tracksCopy) {
    if (artists[track.artist]) {
      track.artistName = artists[track.artist].name
    }
  }
  
  return (
    <div id={displayType} onScroll={scroll} >
      {
        tracks.map((track, index) => {
          let blockStyle = {}
      
          if (displayType == 'itemBlocks') {
            blockStyle = { backgroundImage: `url(${track.imageSrc.uri})` }
          }
      
          return (
            <div className="trackListItem" key={track.id} >
              <div className="ratioContainer" >
                <div className="blockBackground" style={blockStyle} />
                <div className="stretchBox" >
                  <Track
                    mediaManager={mediaManager} track={track} index={index}
                    hasScrolled={getScrollStatus} displayType={displayType} withArtist={withArtist}
                  />
                  <div className="itemActions">
                    <Link to={`/track/modify/${ track.id }`} ><i className="fa fa-pen icon button" /></Link>
                  </div>
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
  tracks: PropTypes.array,
  displayType: PropTypes.string.isRequired,
  withArtist: PropTypes.bool.isRequired,
}
  
export default TrackList