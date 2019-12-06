import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import MediaManager from '../../utils/MediaManager'

const stopPropagation = e => e.stopPropagation()

const Track = ({ mediaManager, id, index, hasScrolled, children }) => {
  const history = useHistory()

  let buttonPressTimer = null
  
  const startPlay = useCallback(() => mediaManager.startPlay(id, index))
    
  const press = useCallback(() => {
    buttonPressTimer = setTimeout(() => {
      if (!hasScrolled()) {
        history.push(`/track/modify/${id}`)
      }
    }, 500)
  })
  
  const release = useCallback(() => clearTimeout(buttonPressTimer))

  return (
    <div
      className="itemInfo"
      onClick={startPlay} onTouchStart={press} onTouchEnd={release}
    >
      {children}
    </div>
  )
}

Track.propTypes = {
  mediaManager: PropTypes.instanceOf(MediaManager),
  id: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  hasScrolled: PropTypes.func.isRequired,
  children: PropTypes.node
}

const TrackList = ({ tracks, filter, displayType, withArtist }) => {
  let hasScrolled = false
  let scrollTimeout = null

  const mediaManager = useSelector(state => state.media.manager)

  const scroll = useCallback(() => {
    hasScrolled = true
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    scrollTimeout = setTimeout(() => hasScrolled = false, 1000)
  })
  const getScrollStatus = useCallback(() => hasScrolled)

  const formatDuration = (duration) => {
    let minutes = '0' + Math.round(duration / 60)
    let seconds = '0' + (duration % 60)
    return `${minutes.substr(-2)} : ${seconds.substr(-2)}`
  }
  
  let artists = global.dataStorage.get('artists')
  
  let tracksCopy = tracks.map(track => { return { ...track } })
  for (let track of tracksCopy) {
    if (artists[track.artist]) {
      track.artistName = artists[track.artist].name
    }
  }
  
  let filtered = tracksCopy.filter(track => `${track.artistName}${track.title}`.toUpperCase().indexOf(filter.toUpperCase()) > -1)

  return (
    <div id={displayType} onScroll={scroll} >
      {
        filtered.map((track, index) => {
          let blockStyle = {}
      
          if (displayType == 'itemBlocks') {
            blockStyle = { backgroundImage: `url(${track.imageSrc.uri}` }
          }
      
          return (
            <div className="trackListItem" key={track.id} >
              <div className="ratioContainer" >
                <div className="blockBackground" style={blockStyle} />
                <div className="stretchBox" >
                  <Track
                    mediaManager={mediaManager} id={track.id} index={index}
                    hasScrolled={getScrollStatus}
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
                  </Track>
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
  
export default TrackList