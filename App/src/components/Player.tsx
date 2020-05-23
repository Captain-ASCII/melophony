import React, { useRef, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { selectMediaManager } from '@selectors/App'
import { selectPlaylist } from '@selectors/App'

import { setPlaylist, setMediaManager } from '@actions/App'

import InputRange from '@components/InputRange'
import IconButton from '@components/IconButton'

const Player = (): JSX.Element => {
  const dispatch = useDispatch()

  const mediaManager = selectMediaManager()
  const playlist = selectPlaylist()
  const currentTrack = playlist.getCurrent()

  const [ isPlaying, setIsPlaying ] = useState(false)

  const player = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    dispatch(setMediaManager(mediaManager.withAudio(player.current).onPlayPause(setIsPlaying)))
  }, [ dispatch ])

  useEffect(() => {
    if (currentTrack) {
      mediaManager.setTrack(currentTrack)
      mediaManager.play()
    }
  }, [ currentTrack, mediaManager ])

  const getCurrentTrackUrl = useCallback(() => {
    if (currentTrack) {
      return `/modify/track/${currentTrack.getId()}`
    }
  }, [ currentTrack ])

  const playPause = useCallback(() => {
    if (currentTrack) {
      mediaManager.playPause()
    } else {
      dispatch(setPlaylist(playlist.next()))
    }
  }, [ dispatch, mediaManager, currentTrack, playlist ])

  const previous = useCallback(() => {
    dispatch(setPlaylist(playlist.previous()))
  }, [ dispatch, playlist ])

  const next = useCallback(() => {
    dispatch(setPlaylist(playlist.next()))
  }, [ dispatch, playlist ])

  return (
    <>
      <audio id="player" ref={player}>
        <p>If you are reading this, it is because your browser does not support the audio element.</p>
      </audio>
      <div id="controls">
        <IconButton icon="backward" onClick={previous} />
        <IconButton icon={isPlaying ? 'pause' : 'play'} onClick={playPause} />
        <IconButton icon="forward" onClick={next} />
      </div>
      <Link to={getCurrentTrackUrl} id="currentTrackInfoLink" >
        <div id="currentTrackInfo"  />
      </Link>
      <InputRange track={currentTrack} asReader />
    </>
  )
}

export default Player