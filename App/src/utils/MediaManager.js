import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { setPlaylist } from 'actions/App'

import { selectConfiguration } from 'selectors/Configuration'
import { selectPlaylist } from 'selectors/App'

import InputRange from 'components/InputRange'

const MediaManager = () => {
  const dispatch = useDispatch()

  const EXTRACT_DURATION = 2000

  const configuration = selectConfiguration()
  const playlist = selectPlaylist()
  const currentTrack = playlist.getCurrent()

  const [ isPlayingExtract, setIsPlayingExtract ] = useState(false)
  const [ extractTimeout, setExtractTimeout ] = useState(null)

  const player = useRef()

  const onKeyDown = event => {
    let tag = event.target.tagName.toLowerCase()
    if (event.keyCode == 32 && tag != 'input' && tag != 'textarea') {
      playPause()
    }
  }
  window.addEventListener('keydown', e => onKeyDown(e))

  const getCurrentTrackUrl = useCallback(() => {
    if (currentTrack) {
      return `/modify/track/${currentTrack.getId()}`
    }
  })

  const startPlay = track => {
    player.current.addEventListener('error', event => {
      if (event.target.error && event.target.error.code == 4) {
        next()
      }
    })

    player.current.src = `${configuration['serverAddress']}/files/${track.videoId}.m4a`
    player.current.currentTime = track.getStartTime()

    player.current.ontimeupdate = () => {
      if (player.current.currentTime > track.getEndTime()) {
        next()
      }
    }
    document.getElementById('currentTrackInfo').innerHTML = `${track.getArtistName()} - ${track.getTitle()}`

    play()
  }

  const play = () => {
    if (player.current.src === '') {
      next()
    } else {
      player.current.onended = () => next()
      player.current.play()
      document.getElementById('playButton').className = 'fa fa-pause fa-2x'
    }
  }

  const pause = () => {
    player.current.pause()
    document.getElementById('playButton').className = 'fa fa-play fa-2x'
  }

  const playPause = useCallback(() => {
    if (player.current.paused) {
      play()
    } else {
      pause()
    }
  })

  const previous = useCallback(() => {
    dispatch(setPlaylist(playlist.previous()))
  })

  const next = useCallback(() => {
    dispatch(setPlaylist(playlist.next()))
  })

  const playExtract = (track, time) => {
    player.current.onended = () => false

    if (!isPlayingExtract) {
      player.current.src = `${configuration['serverAddress']}/files/${track.videoId}.m4a`
      setIsPlayingExtract(true)
    }
    player.current.currentTime = time
    player.current.play()
    if (extractTimeout) {
      clearTimeout(extractTimeout)
    }
    setExtractTimeout(setTimeout(() => player.current.pause(), MediaManager.EXTRACT_DURATION))
  }

  useEffect(() => {
    if (currentTrack) {
      startPlay(currentTrack)
    }
  }, [currentTrack])

  useEffect(() => {
    dispatch(setPlaylist(playlist.withShuffleMode(configuration['shuffleMode'])))
  }, [configuration])

  return (
    <>
      <audio id="player" ref={player}>
        <p>If you are reading this, it is because your browser does not support the audio element.</p>
      </audio>
      <div id="controls">
        <div className="button icon" onClick={previous} ><i className="fa fa-backward fa-2x"  /></div>
        <div className="button icon" onClick={playPause} ><i id="playButton" className="fa fa-play fa-2x" tabIndex="-1" /></div>
        <div className="button icon" onClick={next} ><i className="fa fa-forward fa-2x"  /></div>
      </div>
      <Link to={getCurrentTrackUrl} id="currentTrackInfoLink" >
        <div id="currentTrackInfo"  />
      </Link>
      <InputRange track={currentTrack} asReader />
    </>
  )
}

export default MediaManager