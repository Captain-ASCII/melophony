import React, { useCallback } from 'react'

const IconButton = <T extends unknown>({ id, onClick, title, icon, data, className }:
{ id?: string; onClick?: (d: T, event?: React.MouseEvent) => void; title?: string; icon: string; data?: T; className?: string }): JSX.Element => {
  const handleClick = useCallback((event) => {
    if (onClick) {
      onClick(data, event)
    }
  }, [ onClick, data ])

  return (
    <div className={`button icon ${className}`} id={id} tabIndex={0} onClick={handleClick} >
      <i className={`fa fa-${icon}`} title={title} />
      <div className="overlay" />
    </div>
  )
}

export default IconButton