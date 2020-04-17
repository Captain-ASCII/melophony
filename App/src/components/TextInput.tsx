import React, { useCallback, useState } from 'react'

const TextInput = ({ id, icon, type, onInput }: { id: string; type?: string; icon: string; onInput: (t: string) => void }): JSX.Element => {

  const [ value, setValue ] = useState('')

  const input = useCallback(text => {
    setValue(text)
    onInput(text)
  }, [ onInput ])

  // Needed ?
  const handleChange = useCallback(() => false, [])
  const handleInput = useCallback(event => input(event.target.value), [ input ])
  const handleReset = useCallback(() => input(''), [ input ])

  return (
    <div className="text-input">
      <i className={`fa fa-${icon} icon`} />
      <input
        id={id} type={type || 'text'} value={value}
        onInput={handleInput} onChange={handleChange}
      />
      <i className="fa fa-times icon clear-icon button" onClick={handleReset}  />
    </div>
  )
}

export default TextInput