import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { FixedSizeList as List } from 'react-window'

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

const RTrack = ({ track, style }: { track: Track; style: any }): JSX.Element => {
  const dispatch = useDispatch()
  const history = useHistory()

  const playlist = selectPlaylistManager()

  const longPress = useLongPress(() => history.push(`/modify/track/${track.getId()}`), 500)
  const startPlay = useCallback(() => {
    dispatch(setPlaylistManager(playlist.withTrack(track)))
  }, [ dispatch, playlist, track ])

  const stopPropagation = useCallback((e: React.MouseEvent): void => e.stopPropagation(), [])
  const handleEnqueue = useCallback((data:any, e: React.MouseEvent) => {
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
    <div id={KeyboardManager.getId(track)} className="itemInfo" onClick={startPlay} {...longPress} style={style} >
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



const TrackList = ({ tracks, className = '', height }: { tracks: Array<Track>; className?: string; height: number }): JSX.Element => {

  const [size, setSize] = useState(MediaUtils.isMobileScreen() ? 66 : 36)

  useEffect(() => {
    window.addEventListener('resize', () => setSize(MediaUtils.isMobileScreen() ? 66 : 36))
  })


  const renderer = ({index, style, data}: {index: number, style: any, data: Array<Track>}) => {
    return <RTrack style={style} track={data[index]} />
  }

  return (
    <List className={className} height={height} itemCount={tracks.length} itemSize={size} width={'100%'} itemData={tracks} >{renderer}</List>
  )
}

export default TrackList