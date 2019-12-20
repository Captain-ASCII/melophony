import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'

const TextInput = ({ id, icon, onInput }) => {
  const [ value, setValue ] = useState('')

  const input = useCallback(text => {
    setValue(text)
    onInput(text)
  })
  
  // Needed ?
  const handleChange = useCallback(() => false)
  const handleInput = useCallback(event => input(event.target.value))
  const handleReset = useCallback(() => input(''))
  
  return (
    <div className="text-input">
      <i className={`fa fa-${icon} icon`} />
      <input
        id={id} type="text" value={value}
        onInput={handleInput} onChange={handleChange}
      />
      <i className="fa fa-times icon clear-icon button" onClick={handleReset}  />
    </div>
  )
}
  
TextInput.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  onInput: PropTypes.func
}

export default TextInput