import React from 'react'

export default function Title({ title }: { title: Str }): JSX.Element {
  return (
    <div className="title" >
      <h3>{ title }</h3>
      <div className="delimiter" />
    </div>
  )
}