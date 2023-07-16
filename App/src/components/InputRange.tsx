import React, { useState, useRef, useEffect, useCallback } from 'react'

import StringUtils from '@utils/StringUtils'

import Track from '@models/Track'
import MediaManager from '@utils/MediaManager'
import { selectMediaManager } from '@selectors/App'

const getPercentage = (range: HTMLInputElement, value: number, track: Track, inverted = false): string => {
  let base = 100, unit = '%', diff = 0
  if (range != null)  {
    base = range.offsetWidth, unit = 'px', diff = 9
  }
  let percentage = (value / track.getFullDuration()) * (base - diff)
  if (inverted) {
    percentage = base - percentage
  }
  return `${percentage}${unit}`
}

let intervalHandle: any

const InputRange = ({ track, multiRange, disabled = false, asReader, onStartSet, onEndSet }:
  { track: Track | null; multiRange?: boolean; asReader?: boolean; disabled?: boolean; id?: string;
    onStartSet?: (v: number) => void; onEndSet?: (v: number) => void }): JSX.Element | null => {

  if (track) {
    const mediaManager = selectMediaManager()
    const trackerRef = useRef<HTMLInputElement>(null)

    const [ id, _ ] = useState(StringUtils.generateId())
    const [ leftValue, setLeftValue ] = useState(getPercentage(trackerRef.current, track.getStartTime(), track))
    const [ rightValue, setRightValue ] = useState(asReader ? 100 : getPercentage(trackerRef.current, track.getEndTime(), track, true))

    let handler = null
    const max = asReader ? track.getEndTime() : track.getFullDuration()

    if (asReader) {
      const element = document.getElementById('player')
      const player = element as HTMLAudioElement

      handler = useCallback(event => {
        if (element) {
          player.currentTime = event.target.value
          setRightValue(getPercentage(trackerRef.current, player.currentTime, track, true))
        }
      }, [ element, player.currentTime, track ])

      const setTrackBar = function(value: number) {
        if (trackerRef && trackerRef.current) {
          trackerRef.current.value = value.toString()
          setRightValue(getPercentage(trackerRef.current, value, track, true))
        }
      }

      useEffect(() => {
        if (intervalHandle) {
          clearInterval(intervalHandle)
        }
        intervalHandle = setInterval(() => setTrackBar(player.currentTime), 500)
        setTrackBar(track.getStartTime())
      }, [ track ])

    } else {
      handler = useCallback(event => {
        const value = event.target.value
        mediaManager.playExtract(value)
        setRightValue(getPercentage(trackerRef.current, value, track, true))
        onEndSet(Math.max(0, parseInt(value) + (MediaManager.EXTRACT_DURATION / 1000)))
      }, [ onEndSet, mediaManager, track ])
    }

    const defaultValue = asReader ? 0 : track.getEndTime()
    const handleMainInput = handler
    const handleSecondaryInput = useCallback(event => {
      const value = event.target.value
      mediaManager.playExtract(value)
      setLeftValue(getPercentage(trackerRef.current, value, track))
      onStartSet(parseInt(value))
    }, [ onStartSet, mediaManager, track ])

    const disabledClass = disabled ? 'disabled' : ''

    return (
      <div id={id} className="tracker multi-range" >
        <div className="trackSlider" style={{ left: '0%', right: '0%' }}>
          <div className={`trackBar ${disabledClass}`} style={{left: leftValue, right: rightValue}}  />
        </div>
        {
          multiRange &&
          <input
            className={`rangeDeactivate ${disabledClass}`} type='range'
            min={0} max={track.getFullDuration()} defaultValue={track.getStartTime()} disabled={disabled}
            step="0.5" onInput={handleSecondaryInput}
          />
        }
        <input
          ref={trackerRef} className={`mainRange ${multiRange ? 'rangeDeactivate' : ''} ${disabledClass}`} type='range'
          min={0} max={max} defaultValue={defaultValue} disabled={disabled}
          step={asReader ? "1" : "0.1"} onInput={handleMainInput}
        />
      </div>
      )
  }

  return null
}

export default InputRange