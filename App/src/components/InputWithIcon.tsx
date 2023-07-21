import React from 'react'

import Icon, { IconParameters } from '@components/Icon'

export interface InputWithIconParameters {
  children?: React.ReactNode;
  lines?: Array<(icon: JSX.Element) => JSX.Element>;
}

export default function InputWithIcon({ children, lines, icon, type = undefined, collection = undefined }: InputWithIconParameters & IconParameters): JSX.Element {
  const iconElement = <Icon icon={icon} size="2x" type={type} collection={collection} />
  let content: JSX.Element | Array<JSX.Element> = (<>{ iconElement }{ children }</>)

  if (lines) {
    content = lines.map(render => <div className="inputLine">{ render(iconElement) }</div>)
  }

  return (
    <div className="input">
      { content }
    </div>
  )
}