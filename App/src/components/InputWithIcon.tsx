import React from 'react'

import Icon, { IconParameters } from '@components/Icon'

export default function InputWithIcon({ children, icon, type = undefined, collection = undefined }: { children: React.ReactNode; } & IconParameters): JSX.Element {
  return (
    <div className="input">
      <Icon icon={icon} size="2x" type={type} collection={collection} />
      { children }
    </div>
  )
}