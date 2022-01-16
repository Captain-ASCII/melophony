import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { addListener } from '@actions/Event'
import EventListener from '@models/EventListener'
import OverlayMessage from '@models/OverlayMessage'

const ConfirmOverlay = (): JSX.Element | null => {
  const dispatch = useDispatch()

  const [ overlay, setOverlay ] = useState(null)

  useEffect(() => {
    dispatch(
      addListener(
        new EventListener<OverlayMessage>('OVERLAY_ID', (event) => {
          setOverlay(event.getPayload())
        })
      )
    )
  }, [ dispatch ])

  const cancel = useCallback(() => {
    overlay.getConfirmCallback()(false)
    setOverlay(null)
  }, [ overlay ])

  const confirm = useCallback(() => {
    overlay.getConfirmCallback()(true)
    setOverlay(null)
  }, [ overlay ])

  return overlay ? (
    <div className="fullOverlayBackground" style={{display: 'flex'}}>
      <div className="fullOverlay">
        <p id="confirmMessage" >{overlay.getMessage()}</p>
        <div id="confirmActionBox">
          <div id="cancelButton" className="button raised" onClick={cancel} >No</div>
          <div id="confirmButton" className="button raised" onClick={confirm} >Yes</div>
        </div>
      </div>
    </div>
  ) : null
}

export default ConfirmOverlay