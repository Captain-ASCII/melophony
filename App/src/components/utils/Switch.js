import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'

export class SwitchState {
  constructor(icon, value) {
    this.icon = icon
    this.value = value
  }

  static NULL = new SwitchState('', '')
}

const Switch = ({ isActive, onSwitch, title, enabledState, disabledState }) => {
  const [ active, setActive ] = useState(isActive)
  const [ iconState, setIconState ] = useState(isActive ? `fa-${enabledState.icon}` : `fa-${disabledState.icon}`)
 
  const handleSwitch = useCallback(() => {
    const iconState = active ? `fa-${disabledState.icon}` : `fa-${enabledState.icon}`
    const value = active ? disabledState.value : enabledState.value

    onSwitch(value)
    setActive(prevActive => !prevActive)
    setIconState(iconState)
  })
  
  return (
    <i
      className={`fa ${iconState} icon button`}
      onClick={handleSwitch} title={title}
    />
  )
}

Switch.propTypes = {
  isActive: PropTypes.bool,
  onSwitch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  enabledState: PropTypes.instanceOf(SwitchState).isRequired,
  disabledState: PropTypes.instanceOf(SwitchState).isRequired,
}



const SimpleSwitch = ({ icon, isActive, onSwitch, title, configurationSwitch }) => {
  return (
    <Switch
      isActive={isActive}
      onSwitch={onSwitch}
      title={title}
      configurationSwitch={configurationSwitch}
      enabledState={new SwitchState(icon, true)} disabledState={new SwitchState(icon, false)}
    />
  )        
}

SimpleSwitch.propTypes = {
  icon: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onSwitch: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  configurationSwitch: PropTypes.string,
}
  
export { SimpleSwitch }

export default Switch