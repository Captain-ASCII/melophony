import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'

import { selectPlaylist } from '@selectors/App'
import { setPlaylist } from '@actions/App'

import Track from '@models/Track'
import MediaUtils from '@utils/MediaUtils'

const formatDuration = (duration: number): string => {
  const minutes = '0' + Math.round(duration / 60)
  const seconds = '0' + (duration % 60)
  return `${minutes.substr(-2)} : ${seconds.substr(-2)}`
}

const RTrack = ({ track, hasScrolled, displayType }: { track: Track; hasScrolled: () => boolean; displayType: string }): JSX.Element => {
  const dispatch = useDispatch()
  const history = useHistory()

  const playlist = selectPlaylist()

  const [ buttonPressTimer, setButtonPressTimer ] = useState(null)

  const startPlay = useCallback(() => {
    dispatch(setPlaylist(playlist.withTrack(track)))
  }, [ dispatch, playlist, track ])

  const press = useCallback(() => {
    setButtonPressTimer(
      setTimeout(() => {
        if (!hasScrolled()) {
          history.push(`/modify/track/${track.getId()}`)
        }
      }, 500)
    )
  }, [ history, hasScrolled, track ])

  const release = useCallback(() => clearTimeout(buttonPressTimer), [ buttonPressTimer ])

  const stopPropagation = useCallback((e: React.MouseEvent): void => e.stopPropagation(), [])
  const handleEnqueue = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(setPlaylist(playlist.enqueue(track)))
  }, [ dispatch, playlist, track ])

  const renderArtistName = (): JSX.Element => {
    const artistNameElement = <p className="artist" >{track.getArtist().getName()}</p>
    return MediaUtils.isMobileScreen() ?
    artistNameElement :
    (
      <Link to={`/artist/${track.getArtist().getId()}`} onClick={stopPropagation}>
        { artistNameElement }
      </Link>
    )
  }

  return (
    <div className="itemInfo" onClick={startPlay} onTouchStart={press} onTouchEnd={release} >
      <div className="mainTrackInfo" >
        <p className="title" >{track.getTitle()}</p>
        { renderArtistName() }
      </div>
      <div className="optionalTrackInfo" >
        {/* <div id={`${track.getFile().getVideoId()}Progress`} className={displayType == 'itemList' ? 'progressBar' : ''}  /> */}
        <p className="duration" >{formatDuration(track.getDuration())}</p>
        <div className="itemActions">
          <i className="fa fa-plus-square icon button" onClick={handleEnqueue} />
          <Link to={`/modify/track/${track.getId()}`} onClick={stopPropagation} ><i className="fa fa-pen icon button" /></Link>
        </div>
      </div>
    </div>
  )
}



const TrackList = ({ tracks, displayType }: { tracks: Array<Track>; displayType: string }): JSX.Element => {

  const [ hasScrolled, setHasScrolled ] = useState(false)
  const [ scrollTimeout, setScrollTimeout ] = useState(null)

  const scroll = useCallback(() => {
    setHasScrolled(true)
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    setScrollTimeout(setTimeout(() => setHasScrolled(false), 1000))
  }, [ scrollTimeout ])

  const getScrollStatus = useCallback(() => hasScrolled, [ hasScrolled ])

  return (
    <div id={displayType} onScroll={scroll} >
      {
        tracks.map((track) => {
          const blockStyle = {}

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

export default TrackList