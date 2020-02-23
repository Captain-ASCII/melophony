import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

import Track from 'models/Track'

const getPercentage = (value, track) => {
  return (value / track.getDuration()) * 100
}
let intervalHandle = null

const InputRange = ({ track, multiRange, asReader, mediaManager }) => {
  if (track) {
    const trackerRef = useRef()

    let handler = null
    const max = asReader ? track.getEndTime() : track.getDuration()

    if (asReader) {
      const player = document.getElementById('player')

      handler = useCallback(event => {
        player.currentTime = event.target.value
        setRightValue(100 - getPercentage(player.currentTime, track))
      })
      useEffect(() => {
        if (intervalHandle) {
          clearInterval(intervalHandle)
        }
        intervalHandle = setInterval(() => {
          trackerRef.current.value = player.currentTime
          setRightValue(100 - getPercentage(player.currentTime, track))
        }, 200)
      }, [track])
    } else {
      handler = useCallback(event => {
        const value = event.target.value
        mediaManager.playExtract(track, value)
        setRightValue(100 - getPercentage(value, track))
        track.endTime = Math.max(0, parseInt(value) + (mediaManager.EXTRACT_DURATION / 1000))
      })
    }

    const [ leftValue, setLeftValue ] = useState(getPercentage(track.getStartTime(), track))
    const [ rightValue, setRightValue ] = useState(asReader ? 100 : 100 - getPercentage(track.getEndTime(), track))

    const defaultValue = asReader ? 0 : track.getEndTime()
    const handleMainInput = handler
    const handleSecondaryInput = useCallback(event => {
      const value = event.target.value
      mediaManager.playExtract(track, value)
      setLeftValue(getPercentage(value, track))
      track.startTime = parseInt(value)
    })

    return (
      <div id="tracker" className="multi-range" >
        <div className="trackSlider" style={{ left: '0%', right: '0%' }}  />
        {
          multiRange &&
          <input
            className="rangeDeactivate" type='range'
            min={0} max={track.getDuration()} defaultValue={track.startTime}
            step="0.5" onInput={handleSecondaryInput}
          />
        }
        <input
          ref={trackerRef} className={`mainRange ${multiRange ? 'rangeDeactivate' : ''}`} type='range'
          min={0} max={max} defaultValue={defaultValue}
          step="0.5" onInput={handleMainInput}
        />
        <div className="trackBar" style={{left: `${leftValue}%`, right: `${rightValue}%`}}  />
      </div>
      )
  }

  return null
}

InputRange.propTypes = {
  track: PropTypes.instanceOf(Track),
  multiRange: PropTypes.bool,
  asReader: PropTypes.bool,
  mediaManager: PropTypes.element
}

export default InputRange