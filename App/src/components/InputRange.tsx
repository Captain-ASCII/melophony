import React, { useState, useRef, useEffect, useCallback } from 'react'

import Track from '@models/Track'
import MediaManager from '@utils/MediaManager'
import { selectMediaManager } from '@selectors/App'

const getPercentage = (value: number, track: Track): number => {
  return (value / track.getDuration()) * 100
}

let intervalHandle: any

const InputRange = ({ track, multiRange, disabled = false, asReader, onStartSet, onEndSet }:
  { track: Track | null; multiRange?: boolean; asReader?: boolean; disabled?: boolean;
    onStartSet?: (v: number) => void; onEndSet?: (v: number) => void }): JSX.Element | null => {

  if (track) {
    const [ leftValue, setLeftValue ] = useState(getPercentage(track.getStartTime(), track))
    const [ rightValue, setRightValue ] = useState(asReader ? 100 : 100 - getPercentage(track.getEndTime(), track))

    const mediaManager = selectMediaManager()
    const trackerRef = useRef<HTMLInputElement>(null)

    let handler = null
    const max = asReader ? track.getEndTime() : track.getDuration()

    if (asReader) {
      const element = document.getElementById('player')
      const player = element as HTMLAudioElement

      handler = useCallback(event => {
        if (element) {
          player.currentTime = event.target.value
          setRightValue(100 - getPercentage(player.currentTime, track))
        }
      }, [ element, player.currentTime, track ])

      useEffect(() => {
        if (intervalHandle) {
          clearInterval(intervalHandle)
        }
        intervalHandle = setInterval(() => {
          if (trackerRef && trackerRef.current) {
            trackerRef.current.value = player.currentTime.toString()
            setRightValue(100 - getPercentage(player.currentTime, track))
          }
        }, 200)
      }, [ track, player.currentTime ])

    } else {
      handler = useCallback(event => {
        const value = event.target.value
        mediaManager.playExtract(value)
        setRightValue(100 - getPercentage(value, track))
        onEndSet(Math.max(0, parseInt(value) + (MediaManager.EXTRACT_DURATION / 1000)))
      }, [ onEndSet, mediaManager, track ])
    }

    const defaultValue = asReader ? 0 : track.getEndTime()
    const handleMainInput = handler
    const handleSecondaryInput = useCallback(event => {
      const value = event.target.value
      mediaManager.playExtract(value)
      setLeftValue(getPercentage(value, track))
      onStartSet(parseInt(value))
    }, [ onStartSet, mediaManager, track ])

    const disabledClass = disabled ? 'disabled' : ''

    return (
      <div id="tracker" className="multi-range" >
        <div className="trackSlider" style={{ left: '0%', right: '0%' }}  />
        {
          multiRange &&
          <input
            className={`rangeDeactivate ${disabledClass}`} type='range'
            min={0} max={track.getDuration()} defaultValue={track.getStartTime()} disabled={disabled}
            step="0.5" onInput={handleSecondaryInput}
          />
        }
        <input
          ref={trackerRef} className={`mainRange ${multiRange ? 'rangeDeactivate' : ''} ${disabledClass}`} type='range'
          min={0} max={max} defaultValue={defaultValue} disabled={disabled}
          step="0.5" onInput={handleMainInput}
        />
        <div className={`trackBar ${disabledClass}`} style={{left: `${leftValue}%`, right: `${rightValue}%`}}  />
      </div>
      )
  }

  return null
}

export default InputRange