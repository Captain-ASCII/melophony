import React, { useCallback } from 'react'

const IconButton = <T extends unknown>({ onClick, title, icon, data }: { onClick: (d: T) => void; title: string; icon: string; data?: T }): JSX.Element => {
  const handleClick = useCallback(() => onClick(data), [ onClick, data ])

  return (
    <i className={`fa fa-${icon} icon button`} onClick={handleClick} title={title}  />
  )
}

export default IconButton