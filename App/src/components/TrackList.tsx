import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'

import { selectPlaylistManager } from '@selectors/App'
import { setPlaylistManager } from '@actions/App'

import Track from '@models/Track'
import MediaUtils from '@utils/MediaUtils'

import IconButton from '@components/IconButton'

import useLongPress from '../hooks/LongPressHook'
import KeyboardManager from '@utils/KeyboardManager'

const formatDuration = (duration: number): string => {
  const minutes = '0' + Math.floor(duration / 60)
  const seconds = '0' + (duration % 60)
  return `${minutes.substr(-2)} : ${seconds.substr(-2)}`
}

const RTrack = ({ track }: { track: Track }): JSX.Element => {
  const dispatch = useDispatch()
  const history = useHistory()

  const playlist = selectPlaylistManager()

  const longPress = useLongPress(() => history.push(`/modify/track/${track.getId()}`), 500)
  const startPlay = useCallback(() => {
    dispatch(setPlaylistManager(playlist.withTrack(track)))
  }, [ dispatch, playlist, track ])

  const stopPropagation = useCallback((e: React.MouseEvent): void => e.stopPropagation(), [])
  const handleEnqueue = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(setPlaylistManager(playlist.enqueue(track)))
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
    <div id={KeyboardManager.getClickId(track)} className="itemInfo" onClick={startPlay} {...longPress} >
      <div className="mainTrackInfo" >
        <p className="title" >{track.getTitle()}</p>
        { renderArtistName() }
      </div>
      <div className="optionalTrackInfo" >
        <p className="duration" >{formatDuration(track.getDuration())}</p>
        <div className="itemActions">
          <IconButton icon="plus-square" onClick={handleEnqueue} />
          <Link to={`/modify/track/${track.getId()}`} onClick={stopPropagation} ><IconButton icon="pen" /></Link>
        </div>
      </div>
    </div>
  )
}



const TrackList = ({ tracks, className = '' }: { tracks: Array<Track>; className?: string }): JSX.Element => {
  return (
    <div className={className} >
      {
        tracks.map((track) => {
          const blockStyle = {}

          return (
            <div id={KeyboardManager.getId(track)} className="trackListItem" key={track.getId()} >
              <div className="ratioContainer" >
                <div className="blockBackground" style={blockStyle} />
                <div className="stretchBox" >
                  <RTrack track={track} />
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