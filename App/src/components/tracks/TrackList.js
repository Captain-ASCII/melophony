import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'

import { setCurrentTrack } from 'actions/App'
import { selectArtist } from 'selectors/Artist'

import Track from 'models/Track'

import MediaManager from '../../utils/MediaManager'

const stopPropagation = e => e.stopPropagation()

const formatDuration = (duration) => {
  let minutes = '0' + Math.round(duration / 60)
  let seconds = '0' + (duration % 60)
  return `${minutes.substr(-2)} : ${seconds.substr(-2)}`
}

const RTrack = ({ mediaManager, track, index, hasScrolled, displayType, withArtist }) => {
  const dispatch = useDispatch()
  const history = useHistory()

  const artist = selectArtist(track.getArtistId())

  const startPlay = useCallback(() => {
    mediaManager.startPlay(track.getId(), index)
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

  return (
    <div
      className="itemInfo"
      onClick={startPlay} onTouchStart={press} onTouchEnd={release}
    >
      <p className="title " >{track.getTitle()}</p>
      { withArtist ?
        (<Link to={`/artist/${artist.getId()}`} onClick={stopPropagation}>
          <p className="artist" >{artist.getName()}</p>
        </Link>) : null
      }
      <div id={`${track.getVideoId()}Progress`} className={displayType == 'itemList' ? 'progressBar' : ''} >
        <div /> <p />
      </div>
      <p className="duration" >{formatDuration(track.getDuration())}</p>
    </div>
  )
}

RTrack.propTypes = {
  mediaManager: PropTypes.instanceOf(MediaManager),
  track: PropTypes.instanceOf(Track),
  index: PropTypes.number.isRequired,
  hasScrolled: PropTypes.func.isRequired,
  displayType: PropTypes.string.isRequired,
  withArtist: PropTypes.bool.isRequired,
}





const TrackList = ({ tracks, displayType, withArtist }) => {
  const mediaManager = useSelector(state => state.managers.mediaManager)

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
            // blockStyle = { backgroundImage: `url(${track.imageSrc.uri})` }
          }

          return (
            <div className="trackListItem" key={track.getId()} >
              <div className="ratioContainer" >
                <div className="blockBackground" style={blockStyle} />
                <div className="stretchBox" >
                  <RTrack
                    mediaManager={mediaManager} track={track} index={index}
                    hasScrolled={getScrollStatus} displayType={displayType} withArtist={withArtist}
                  />
                  <div className="itemActions">
                    <Link to={`/modify/track/${track.getId()}`} ><i className="fa fa-pen icon button" /></Link>
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
  tracks: PropTypes.arrayOf(PropTypes.instanceOf(Track)),
  displayType: PropTypes.string.isRequired,
  withArtist: PropTypes.bool,
}

export default TrackList