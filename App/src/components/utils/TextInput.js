import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'

const TextInput = ({ id, icon, onInput }) => {
  const [ value, setValue ] = useState('')

  // Needed ?
  const handleChange = useCallback(() => false)

  const handleInput = useCallback(event => {
    setValue(event.target.value)
    onInput(event.target.value)
  })

  const handleReset = useCallback(() => handleInput(''))
  
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