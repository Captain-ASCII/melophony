import React, { useCallback } from 'react'

const IconButton = <T extends unknown>({ onClick, title, icon, data, className }:
  { onClick?: (d: T) => void; title?: string; icon: string; data?: T, className?: string }): JSX.Element => {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(data)
    }
  }, [ onClick, data ])

  return (
    <div className={`button icon ${className}`} onClick={handleClick} >
      <i className={`fa fa-${icon}`} title={title} />
      <div className="overlay" />
    </div>
  )
}

export default IconButton