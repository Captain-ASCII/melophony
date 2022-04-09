import React, { useCallback } from 'react'

import Log from '@utils/Log'

const Button = <T extends unknown>({ onClick, title, icon, data, id = '', className = '' }:
{ onClick: (d: T) => void; title?: string; icon?: string; data?: T; id?:string; className?: string }): JSX.Element => {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(data)
    } else {
      Log.w('No onClick defined')
    }
  }, [ onClick, data ])

  return (
    <div id={id} className={`button ${className}`} onClick={handleClick} >
      { icon && <i className={`fa fa-${icon} icon button`}  /> }
      { title && <p className="buttonTitle" >{ title }</p> }
      <div className="overlay" ></div>
    </div>
  )
}

export default Button