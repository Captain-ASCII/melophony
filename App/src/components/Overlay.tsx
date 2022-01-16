
import React, { useCallback, ReactNode } from 'react'

const Overlay = (props: { children: ReactNode; isOpen: boolean; onChange?: (closed: boolean) => void; className?: string}): JSX.Element => {

  const close = useCallback(() => {
    if (props.onChange) {
      props.onChange(false)
    }
  }, [ props ])

  if (! props.isOpen) {
    return null
  }

  return (
    <>
      <div className="fullOverlay fullOverlayBackground" onClick={close} ></div>
      <div className="fullOverlay fullOverlayBox" >
        <div className={`fullOverlayContent ${props.className}`} >
          { props.children }
        </div>
      </div>
    </>
  )
}

export default Overlay