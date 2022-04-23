import React, { useCallback, useState } from 'react'

import Button from '@components/Button'

class SwitchState<T> {

  private icon: string
  private value: T

  constructor(icon: string, value: T) {
    this.icon = icon
    this.value = value
  }

  static NULL = new SwitchState('', false)

  getIcon(): string {
    return this.icon
  }

  getValue(): T {
    return this.value
  }
}

const Switch = <U extends unknown>({ initial, onSwitch, title, enabledState, disabledState, onOff }:
  { initial: U; onSwitch: (t: U) => void; title?: string; enabledState: SwitchState<U>; disabledState: SwitchState<U>, onOff?: boolean }): JSX.Element => {
  const [ active, setActive ] = useState(initial === enabledState.getValue())
  const [ iconState, setIconState ] = useState(active ? enabledState.getIcon() : disabledState.getIcon())

  const handleSwitch = useCallback(() => {
    const iconState = active ? disabledState.getIcon() : enabledState.getIcon()
    const value = active ? disabledState.getValue() : enabledState.getValue()

    onSwitch(value)
    setActive(prevActive => !prevActive)
    setIconState(iconState)
  }, [ active, disabledState, enabledState, onSwitch ])

  return <Button icon={iconState} className={onOff && active ? 'active' : ''} onClick={handleSwitch} title={title} />
}

// Switch.propTypes = {
//   isActive: PropTypes.bool,
//   onSwitch: PropTypes.func.isRequired,
//   title: PropTypes.string.isRequired,
//   enabledState: PropTypes.instanceOf(SwitchState).isRequired,
//   disabledState: PropTypes.instanceOf(SwitchState).isRequired,
// }

// const ConfigurationSwitch = ({ title, onSwitch, enabledState, disabledState, configurationKey }:
//   { title: string; onSwitch: Function; enabledState: SwitchState; disabledState: SwitchState; configurationKey: string }): JSX.Element => {

//   const dispatch = useDispatch()

//   const configuration = selectConfiguration()

//   const handleSwitch = useCallback(value => {
//     if (onSwitch) {
//       onSwitch(value)
//     }
//     dispatch(setConfiguration(configurationKey, value))
//   }, [])

//   return (
//     <Switch
//       enabledState={enabledState} disabledState={disabledState} onSwitch={handleSwitch}
//       title={title} isActive={configuration[configurationKey] === enabledState.getValue()}
//     />
//   )
// }

// ConfigurationSwitch.propTypes = {
//   title: PropTypes.string.isRequired,
//   onSwitch: PropTypes.func,
//   enabledState: PropTypes.instanceOf(SwitchState).isRequired,
//   disabledState: PropTypes.instanceOf(SwitchState).isRequired,
//   configurationKey: PropTypes.string.isRequired,
// }


// const SimpleSwitch = ({ icon, isActive, onSwitch, title }:
//   { icon: string; isActive: boolean; onSwitch: Function; title: string }): JSX.Element => {
//   return (
//     <Switch
//       isActive={isActive}
//       onSwitch={onSwitch}
//       title={title}
//       enabledState={new SwitchState(icon, true)} disabledState={new SwitchState(icon, false)}
//     />
//   )
// }

// SimpleSwitch.propTypes = {
//   icon: PropTypes.string.isRequired,
//   isActive: PropTypes.bool,
//   onSwitch: PropTypes.func.isRequired,
//   title: PropTypes.string.isRequired,
//   configurationSwitch: PropTypes.string,
// }

// export { SimpleSwitch, ConfigurationSwitch }

export default Switch

export { SwitchState }