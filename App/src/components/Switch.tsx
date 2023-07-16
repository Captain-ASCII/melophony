import React, { useCallback, useState } from 'react'

import Button from '@components/Button'

import { _ } from '@utils/TranslationUtils'

class SwitchState<T> {

  private icon: string
  private value: T
  private title: Str

  constructor(icon: string, value: T, title: Str = '') {
    this.icon = icon
    this.value = value
    this.title = title
  }

  static NULL = new SwitchState('', false)

  getIcon(): string {
    return this.icon
  }

  getValue(): T {
    return this.value
  }

  getTitle(): Str {
    return this.title
  }
}

const Switch = <U extends unknown>({ initial, onSwitch, enabledState, disabledState, onOff }:
  { initial: U; onSwitch: (t: U) => void; enabledState: SwitchState<U>; disabledState: SwitchState<U>, onOff?: boolean }): JSX.Element => {

  const isActive = (state: SwitchState<U>) => state.getValue() === enabledState.getValue()
  const [ state, setState ] = useState(initial === enabledState.getValue() ? enabledState : disabledState);

  const handleSwitch = useCallback(() => {
    const newState = isActive(state) ? disabledState : enabledState
    onSwitch(newState.getValue())
    setState(newState)
  }, [ state, disabledState, enabledState, onSwitch ])

  return <Button icon={state.getIcon()} className={onOff && isActive(state) ? 'active' : ''} onClick={handleSwitch} title={state.getTitle()} />
}

export default Switch

export { SwitchState }