import React, { useCallback } from 'react'

const Button = <T extends unknown>({ onClick, title, icon, data, className }:
  { onClick: (d: T) => void; title: string; icon: string; data?: T, className?: string }): JSX.Element => {
  const handleClick = useCallback(() => onClick(data), [ onClick, data ])

  return (
    <div className={`button ${className}`} onClick={handleClick} >
        <i className={`fa fa-${icon} icon button`}  />
        <p className="buttonTitle" >{ title }</p>
        <div className="overlay" ></div>
    </div>
  )
}

export default Button