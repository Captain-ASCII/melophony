
import React from 'react'
import TextInput from './TextInput'

const Field = ({ title, id, icon, type, onInput }:
  { title: string; id: string; type?: string; icon: string; onInput: (t: string) => void }): JSX.Element => {
  return (
    <div className="field" >
      <p>{ title }</p>
      <TextInput id={id} icon={icon} type={type} onInput={onInput} />
    </div>
  )
}

export default Field