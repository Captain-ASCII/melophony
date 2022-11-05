import React, { useCallback, useState } from 'react'

import Button from '@components/Button'
import Icon from '@components/Icon'

import { useTranslation } from '@utils/TranslationUtils'

const TextInput = ({ id, icon, type, onInput, placeHolder = '', value = null, initialValue = '', disabled = false, className = '' }:
{ id?: string; type?: string; placeHolder?: string; icon?: string;
  onInput?: (t: string) => void; value?: string | number; initialValue?: string; disabled?: boolean;
  className?: string
}): JSX.Element => {

  const [ internalValue, setValue ] = useState(initialValue)

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
      { icon && <Icon icon={icon} /> }
      <input
        id={id} type={type || 'text'} value={value === null ? internalValue : value} placeholder={useTranslation(placeHolder, null)}
        onInput={handleInput} onChange={handleChange} disabled={disabled} className={className}
      />
      { !disabled && <Button icon="times" className="clear-icon" onClick={handleReset} /> }
    </div>
  )
}

export default TextInput