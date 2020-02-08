import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { setCurrentTrack } from 'actions/App'

import { selectTracks } from 'selectors/Track'
import { selectCurrentTrack } from 'selectors/App'

import InputRange from 'components/utils/InputRange'

const MediaManager = () => {
  const dispatch = useDispatch()

  const EXTRACT_DURATION = 2000

  const tracks = selectTracks()
  const currentTrack = selectCurrentTrack()

  const [ currentIndex, setCurrentIndex ] = useState(0)
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

  const startPlay = (id, index) => {
    setCurrentIndex(index)
    const track = tracks.find(track => track.id === id)

    player.current.addEventListener('error', event => {
      if (event.target.error && event.target.error.code == 4) {
        next()
      }
    })

    player.current.src = `${configurationManager.get('serverAddress')}/files/${track.videoId}.m4a`
    player.current.currentTime = track.getStartTime()

    player.current.ontimeupdate = (event) => {
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
    const nextIndex = (currentIndex - 1) % tracks.length
    setCurrentIndex(nextIndex)
    dispatch(setCurrentTrack(tracks[nextIndex]))
    startPlay(`${tracks[nextIndex].id}`, nextIndex)
  })

  const next = useCallback(() => {
    const nextIndex = configurationManager.get('shuffleMode') ? Math.floor(Math.random() * tracks.length) : (currentIndex + 1) % tracks.length
    setCurrentIndex(nextIndex)
    dispatch(setCurrentTrack(tracks[nextIndex]))
    startPlay(`${tracks[nextIndex].id}`, nextIndex)
  })

  const playExtract = (track, time) => {
    player.current.onended = () => false

    if (!isPlayingExtract) {
      player.current.src = `${configurationManager.get('serverAddress')}/files/${track.videoId}.m4a`
      setIsPlayingExtract(true)
    }
    player.current.currentTime = time
    player.current.play()
    if (extractTimeout) {
      clearTimeout(extractTimeout)
    }
    setExtractTimeout(setTimeout(_ => player.current.pause(), MediaManager.EXTRACT_DURATION))
  }

  useEffect(() => {
    if (currentTrack) {
      startPlay(currentTrack.getId(), tracks.findIndex(track => track.getId() === currentTrack.getId()))
    }
  }, [currentTrack])

  return (
    <>
      <audio id="player" ref={player}>
        <p>If you are reading this, it is because your browser does not support the audio element.</p>
      </audio>
      <div id="controls">
        <div className="button icon" onClick={previous} ><i className="fa fa-backward fa-2x"  /></div>
        <div className="button icon" onClick={playPause} ><i id="playButton" className="fa fa-play fa-2x" tabIndex="-1"  /></div>
        <div className="button icon" onClick={next} ><i className="fa fa-forward fa-2x"  /></div>
      </div>
      <InputRange track={currentTrack} asReader />
    </>
  )
}

export default MediaManager