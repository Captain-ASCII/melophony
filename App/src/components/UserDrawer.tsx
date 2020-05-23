import React, { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import JWT from 'jwt-client'

import { init } from '@index'

import { setUser } from '@actions/App'
import { selectUser } from '@selectors/App'

import Button from '@components/Button'

const UserDrawer = (): JSX.Element => {
  const dispatch = useDispatch()

  const user = selectUser()

  const disconnect = useCallback(() => {
    dispatch(setUser(null))
    JWT.forget()
    init()
  }, [])

  return (
    <div id="userDrawer" >
      <p id="userMessage" >Hello { user.getFirstName() } !</p>
      <Button className="red" icon="times-circle" onClick={disconnect} title="Disconnect" />
    </div>
  )
}

export default UserDrawer