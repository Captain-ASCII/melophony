import React, { useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { selectMediaManager } from '@selectors/App'
import { selectPlaylist } from '@selectors/App'

import { setPlaylist, setMediaManager } from '@actions/App'

import InputRange from '@components/InputRange'

const Player = (): JSX.Element => {
  const dispatch = useDispatch()

  const mediaManager = selectMediaManager()
  const playlist = selectPlaylist()
  const currentTrack = playlist.getCurrent()

  const player = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    dispatch(setMediaManager(mediaManager.clone().withAudio(player.current)))
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
        <div className="button icon" onClick={previous} ><i className="fa fa-backward fa-2x"  /></div>
        <div className="button icon" onClick={playPause} ><i id="playButton" className="fa fa-play fa-2x" tabIndex={-1} /></div>
        <div className="button icon" onClick={next} ><i className="fa fa-forward fa-2x"  /></div>
      </div>
      <Link to={getCurrentTrackUrl} id="currentTrackInfoLink" >
        <div id="currentTrackInfo"  />
      </Link>
      <InputRange track={currentTrack} asReader />
    </>
  )
}

export default Player