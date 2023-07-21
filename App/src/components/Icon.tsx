import React from 'react'

export interface IconParameters {
  icon: string;
  collection?: string;
  type?: string;
  size?: string;
  title?: string
  className?: string;
}

export default function InputWithIcon({ icon, collection = 'fa', size = '1x', type = null, title = undefined, className = "" }: IconParameters): JSX.Element {
  return <i className={`${className} ${collection} fa-${icon} fa-${size} icon ${type !== null ? `fa-${type}` : ""}`} title={title} />
}