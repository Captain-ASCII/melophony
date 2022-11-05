import React, { useCallback, useState } from 'react'

import Icon from '@components/Icon'

export interface ButtonParameters<T> {
  title?: Str;
  icon?: string;
  iconSize?: string;
  onClick?: (d: T, event?: React.MouseEvent) => void;
  data?: T;
  id?:string;
  className?: string
}

const Button = <T extends unknown>({ onClick, title = '', icon, iconSize, data, id = '', className = '' }: ButtonParameters<T>): JSX.Element => {

  const handleClick = useCallback((event) => {
    if (onClick) {
      onClick(data, event)
    }
  }, [ onClick, data ])

  const iconClassName = (icon && title === '') ? 'icon' : ''

  return (
    <div id={id} className={`button ${iconClassName} ${className}`} tabIndex={0} onClick={handleClick} >
      { icon && <Icon icon={icon} size={iconSize} /> }
      { title && <p className="buttonTitle" >{ title }</p> }
      <div className="overlay" ></div>
    </div>
  )
}

export default Button