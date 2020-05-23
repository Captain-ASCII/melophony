import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import JWT from 'jwt-client'

import { init } from '@index'

import { setUser } from '@actions/App'
import { selectUser } from '@selectors/App'

import Button from '@components/Button'
import IconButton from '@components/IconButton'

class DrawerState {
  public opened: boolean
  public maxHeight: number
  public icon: string

  constructor(opened: boolean, maxHeight: number, icon: string) {
    this.opened = opened
    this.maxHeight = maxHeight
    this.icon = icon
  }

  public static OPENED = new DrawerState(true, 500, 'chevron-down')
  public static CLOSED = new DrawerState(false, 0, 'chevron-right')
}

const UserDrawer = (): JSX.Element => {
  const dispatch = useDispatch()

  const user = selectUser()

  const [ drawerState, setDrawerState ] = useState(DrawerState.CLOSED)

  const disconnect = useCallback(() => {
    dispatch(setUser(null))
    JWT.forget()
    init()
  }, [ dispatch ])

  const openClose = useCallback(() => {
    setDrawerState(drawerState.opened ? DrawerState.CLOSED : DrawerState.OPENED)
  }, [ drawerState ])

  return (
    <div id="userDrawer" >
      <div id="userName" >
        <p id="userMessage" ><span className="hideWhenClosed">Hello </span>{ user.getFirstName() }</p>
        <IconButton className="hideWhenClosed" icon={drawerState.icon} onClick={openClose} />
      </div>
      <div id="userSpace" style={{ maxHeight: drawerState.maxHeight }} >
        <Button className="raised alert hideWhenClosed" icon="times-circle" onClick={disconnect} title="Disconnect" />
      </div>
    </div>
  )
}

export default UserDrawer