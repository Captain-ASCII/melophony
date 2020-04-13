import React, { useCallback } from 'react'

const Button = <T extends unknown>({ onClick, title, icon, data }: { onClick: (d: T) => void; title: string; icon: string; data?: T }): JSX.Element => {
  const handleClick = useCallback(() => onClick(data), [ onClick, data ])

  return (
    <div className="button" onClick={handleClick} >
        <i className={`fa fa-${icon} icon button`}  />
        <p className="buttonTitle hideWhenClosed" >{ title }</p>
    </div>
  )
}

export default Button