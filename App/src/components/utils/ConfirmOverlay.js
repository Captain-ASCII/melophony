import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { selectListener } from 'selectors/Listener'
import { clearNotification } from 'actions/Listener'

const ConfirmOverlay = ({ overlayId }) => {
  const dispatch = useDispatch()

  const overlay = selectListener('OVERLAY_ID')

  const closeConfirmation = useCallback(() => dispatch(clearNotification('OVERLAY_ID')))

  const cancel = useCallback(() => closeConfirmation())
  const confirm = useCallback(() => {
    overlay.confirmCallback()
    closeConfirmation()
  })

  return overlay ? (
    <div id="overlay" style={{display: 'flex'}}>
      <div id="overlayBox">
        <p id="confirmMessage" >{overlay.message}</p>
        <div id="confirmActionBox">
          <div id="cancelButton" className="button raised" onClick={cancel} >No</div>
          <div id="confirmButton" className="button raised" onClick={confirm} >Yes</div>
        </div>
      </div>
    </div>
  ) : false
}

export default ConfirmOverlay