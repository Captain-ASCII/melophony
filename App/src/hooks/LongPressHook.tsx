import { useCallback, useState, useEffect } from 'react'

export default function useLongPress(callback = () => {}, ms = 300) {
  const [startLongPress, setStartLongPress] = useState(false)

  useEffect(() => {
    let timerId: number

    if (startLongPress) {
      const internalCallback = () => {
        timerId = window.setTimeout(callback, ms / 2)
        callback()
      }
      timerId = window.setTimeout(internalCallback, ms)
    } else {
      clearTimeout(timerId)
    }

    return () => {
      clearTimeout(timerId)
    }
  }, [callback, ms, startLongPress])

  return {
    onTouchStart: () => setStartLongPress(true),
    onTouchEnd: () => setStartLongPress(false),
    onTouchCancel: () => setStartLongPress(false),
    onTouchMove: () => setStartLongPress(false),
  }
}