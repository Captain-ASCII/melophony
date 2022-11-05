import React from 'react'

import CloseButton from './CloseButton'

export default function Screen({ children, title, id }: { children: React.ReactNode; title: Str; id?: string }): JSX.Element {
  return (
    <div id={id} className="screen" >
      <div id="pageHeader">
        <h2 id="pageTitle">{ title }</h2>
        <CloseButton />
      </div>
      { children }
    </div>
  )
}