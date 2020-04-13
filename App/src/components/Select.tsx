import React, { useCallback, useState } from 'react'

import StringUtils from '@utils/StringUtils'

class Option {

  private value: string
  private name: string

  constructor(value: string, name: string) {
    this.value = value
    this.name = name
  }

  getValue(): string {
    return this.value
  }

  getName(): string {
    return this.name
  }
}

const Select = ({ children, placeholder, onSelection, icon }:
  { children: Array<JSX.Element>; placeholder: string; icon: string; onSelection: (value: string) => void }): JSX.Element => {

  const optionsId = StringUtils.generateId()

  const [ selectedOption, setSelectedOption ] = useState(new Option('', placeholder || '...'))

  const openDropDown = useCallback((event) => {
    event.nativeEvent.stopImmediatePropagation()
    const options = document.getElementById(optionsId)
    if (options) {
      options.style.display = 'block'
    }
  }, [ optionsId ])

  const closeDropDown = useCallback(() => {
    const options = document.getElementById(optionsId)
    if (options) {
      options.style.display = 'none'
    }
  }, [ optionsId ])

  const choose = useCallback((event) => {
    event.nativeEvent.stopImmediatePropagation()
    setSelectedOption(new Option(event.target.getAttribute('value'), event.target.innerHTML))
    closeDropDown()

    if (onSelection) {
      onSelection(event.target.getAttribute('value'))
    }
  }, [ closeDropDown, onSelection ])

  document.addEventListener('click', _ => closeDropDown())

  const options = children.map(option =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    <div key={option.props.value} value={option.props.value} className="commonSelect option" onClick={choose} >
      { option.props.children }
    </div>
  )

  return (
    <div className="select" >
      <select style={{ display: 'none' }} >{ children }</select>
      <div className="commonSelect selectCurrent" onClick={openDropDown} >
        { icon ? <i className={`fa fa-${icon}`} ></i> : false }
        { selectedOption.getName() }
        <i className="fa fa-chevron-down" ></i>
      </div>
      <div id={optionsId} className="options" >{ options }</div>
    </div>
  )
}

export default Select