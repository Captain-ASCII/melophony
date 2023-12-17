import React, { useRef, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import StringUtils from '@utils/StringUtils'

import { selectMediaManager } from '@selectors/App'
import { selectPlaylistManager } from '@selectors/App'

import { setPlaylistManager, setMediaManager } from '@actions/App'

import InputRange from '@components/InputRange'
import Button from '@components/Button'
import MediaUtils from '@utils/MediaUtils'

const Player = (): JSX.Element => {
  const dispatch = useDispatch()

  const mediaManager = selectMediaManager()
  const playlist = selectPlaylistManager()
  const currentTrack = playlist.getCurrent()

  const [ isPlaying, setIsPlaying ] = useState(false)
  const [ trackTime, setTrackTime ] = useState("-/-")

  const player = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    dispatch(setMediaManager(mediaManager.withAudio(player.current).onPlayPause((isPlaying: boolean, title: string, artist: string) => {
      setIsPlaying(isPlaying)
      MediaUtils.notifyAndroidPlayerState(isPlaying, title, artist)
    })))
  }, [ dispatch ])

  useEffect(() => {
    if (currentTrack) {
      mediaManager.setTrack(currentTrack)
      mediaManager.play()
    }
  }, [ currentTrack, mediaManager ])

  const playPause = useCallback(() => {
    if (currentTrack) {
      mediaManager.playPause()
    } else {
      dispatch(setPlaylistManager(playlist.next()))
    }
  }, [ dispatch, mediaManager, currentTrack, playlist ])

  const previous = useCallback(() => {
    dispatch(setPlaylistManager(playlist.previous()))
  }, [ dispatch, playlist ])

  const next = useCallback(() => {
    dispatch(setPlaylistManager(playlist.next()))
  }, [ dispatch, playlist ])

  const updateTime = useCallback((t) => {
    setTrackTime(`${StringUtils.formatTime(Math.trunc(player.current.currentTime))}`)
  }, [])

  return (
    <>
      <audio id="player" ref={player} onTimeUpdate={updateTime} >
        <p>If you are reading this, it is because your browser does not support the audio element.</p>
      </audio>
      <div id="left" />
      <div id="bubble" />
      <div id="right" />
      <div id="controls">
        <Button icon="backward" onClick={previous} />
        <Button id="playButton" icon={isPlaying ? 'pause' : 'play'} onClick={playPause} />
        <Button icon="forward" onClick={next} />
      </div>
      { currentTrack &&
        (
          <div id="currentTrackInfo">
            <Link to={`/modify/track/${currentTrack.getId()}`} id="trackTitle" className="currentTrackInfoLink" >{ currentTrack.getTitle() }</Link>
            <Link to={`/artist/${currentTrack.getArtist().getId()}`} id="trackArtist" className="currentTrackInfoLink" >{ currentTrack.getArtist().getName() }</Link>
            <p id="trackTime">
              <span id="currentTime">{trackTime}</span>
              <span id="timeSlash">/</span>
              <span id="duration">{StringUtils.formatTime(player.current.duration)}</span>
            </p>
          </div>
        )
      }
      <InputRange track={currentTrack} asReader />
    </>
  )
}

export default Player