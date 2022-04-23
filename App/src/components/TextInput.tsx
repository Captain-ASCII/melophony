import React, { useCallback, useState } from 'react'

import Button from '@components/Button'

const TextInput = ({ id, icon, type, onInput, placeHolder = '', initialValue = '' }:
{ id?: string; type?: string; placeHolder?: string; icon?: string; onInput: (t: string) => void; initialValue?: string }): JSX.Element => {

  const [ value, setValue ] = useState(initialValue)

  const input = useCallback(text => {
    setValue(text)
    onInput(text)
  }, [ onInput ])

  // Needed ?
  const handleChange = useCallback(() => false, [])
  const handleInput = useCallback(event => input(event.target.value), [ input ])
  const handleReset = useCallback(() => input(''), [ input ])

  return (
    <div className={`text-input ${icon ? "with-icon" : ""}`}>
      { icon && <i className={`fa fa-${icon} icon`} /> }
      <input
        id={id} type={type || 'text'} value={value} placeholder={placeHolder}
        onInput={handleInput} onChange={handleChange}
      />
      <Button icon="times" className="clear-icon" onClick={handleReset} />
    </div>
  )
}

export default TextInput