import React, { useCallback } from 'react'

import { useHistory } from 'react-router-dom'
import IconButton from './IconButton'

export default function CloseButton({ icon, additionalClass }: { icon?: string; additionalClass?: string }): JSX.Element {
  const history = useHistory()

  if (!icon) {
    icon = 'times'
  }

  const goBack = useCallback(() => history.goBack(), [ history ])

  return (
    <div id="closeButton" className={`button icon ${ additionalClass ? additionalClass : '' }`} onClick={goBack} >
      <IconButton icon={icon} className="fa-2x" />
    </div>
  )
}