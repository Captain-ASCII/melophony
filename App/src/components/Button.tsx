import React, { useCallback, useState } from 'react'

import Log from '@utils/Log'

const Button = <T extends unknown>({ onClick, title = '', icon, data, id = '', className = '' }:
{ onClick?: (d: T, event?: React.MouseEvent) => void; title?: string; icon?: string; data?: T; id?:string; className?: string }): JSX.Element => {

  const handleClick = useCallback((event) => {
    if (onClick) {
      onClick(data, event)
    } else {
      Log.w('No onClick defined')
    }
  }, [ onClick, data ])

  const iconClassName = (icon && title === '') ? 'icon' : ''

  return (
    <div id={id} className={`button ${iconClassName} ${className}`} tabIndex={0} onClick={handleClick} >
      { icon && <i className={`fa fa-${icon} icon button`}  /> }
      { title && <p className="buttonTitle" >{ title }</p> }
      <div className="overlay" ></div>
    </div>
  )
}

export default Button