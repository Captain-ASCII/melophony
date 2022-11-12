import React, { useCallback, useState } from 'react'

import Button from '@components/Button'
import Icon from '@components/Icon'

import { useTranslation } from '@utils/TranslationUtils'

export interface TextInputParameters {
  id?: string;
  type?: string;
  placeHolder?: string;
  icon?: string;
  onInput?: (t: string) => void; value?: string | number; initialValue?: string; disabled?: boolean;
  className?: string
}

const PASSWORD = 'password'
const TEXT = 'text'

const TextInput = ({ id, icon, onInput, type = TEXT, placeHolder = '', value = null, initialValue = '', disabled = false, className = '' }: TextInputParameters): JSX.Element => {

  const [ internalValue, setValue ] = useState(initialValue)
  const [ internalType, setInternalType ] = useState(type)

  const input = useCallback(text => {
    setValue(text)
    onInput(text)
  }, [ onInput ])

  // Needed ?
  const handleChange = useCallback(() => false, [])
  const handleInput = useCallback(event => input(event.target.value), [ input ])
  const handleReset = useCallback(() => input(''), [ input ])
  const toggleVisibility = useCallback(() => setInternalType(internalType === PASSWORD ? TEXT : PASSWORD), [ internalType ])

  return (
    <div className={`text-input ${icon ? "with-icon" : ""}`}>
      { icon && <Icon icon={icon} /> }
      <input
        id={id} type={internalType} value={value === null ? internalValue : value} placeholder={useTranslation(placeHolder, null)}
        onInput={handleInput} onChange={handleChange} disabled={disabled} className={className}
      />
      <div className="input-icons right-icon" >
      { (type === 'password') && <Button icon={internalType === PASSWORD ? "eye" : "eye-slash"} onClick={toggleVisibility} /> }
      { !disabled && <Button icon="times" onClick={handleReset} /> }
      </div>
    </div>
  )
}

export default TextInput