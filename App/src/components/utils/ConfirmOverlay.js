import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { addListener } from 'actions/Listener'

const ConfirmOverlay = ({ overlayId }) => {
  const dispatch = useDispatch()

  const overlay = useSelector(state => state.overlay)

  const [ visibility, setVisibility ] = useState(false)

  const displayConfirmation = useCallback(setVisibility(true))
  const closeConfirmation = useCallback(setVisibility(false))

  const cancel = useCallback(() => closeConfirmation())
  const confirm = useCallback(() => {
    closeConfirmation()
  })

  dispatch(addListener(overlayId))

  return visibility ? (
    <div id="overlay" style={{display: 'flex'}}>
      <div id="overlayBox">
        <p id="confirmMessage" >{overlay.confirmMessage}</p>
        <div id="confirmActionBox">
          <div id="cancelButton" className="button raised" onClick={cancel} >No</div>
          <div id="confirmButton" className="button raised" onClick={confirm} >Yes</div>
        </div>
      </div>
    </div>
  ) : false
}

export default ConfirmOverlay