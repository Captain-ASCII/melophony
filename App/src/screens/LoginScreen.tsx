import React, { useState, useCallback } from 'react'
import JWT from 'jwt-client'

import Field from '@components/Field'
import Button from '@components/Button'
import StatusMessage, { MessageType } from '@components/StatusMessage'

import { selectApiManager } from '@selectors/App'
import SessionConfigurator from '@components/SessionConfigurator'

enum Mode {
  LOGIN,
  REGISTER
}

const LoginScreen = ({ getRequiredData }: { getRequiredData: () => void }): JSX.Element => {


  const [ mode, setMode ] = useState(Mode.LOGIN)
  const [ email, setEmail ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ firstName, setFirstName ] = useState('')
  const [ lastName, setLastName ] = useState('')
  const [ errorMessage, setErrorMessage ] = useState('')

  const apiManager = selectApiManager()

  const handleResponse = useCallback((status: number, data: any) => {
    if (status !== 200) {
      setErrorMessage(data.message)
    } else if (data.token && JWT.validate(data.token)) {
      JWT.keep(data.token)
      getRequiredData()
    }
  }, [ getRequiredData ])

  const login = useCallback(() => {
    apiManager.post('/login', { email, password }, handleResponse)
  }, [ apiManager, email, password, handleResponse ])

  const register = useCallback(() => {
    apiManager.post('/register', { email, firstName, lastName, password }, handleResponse)
  }, [ apiManager, email, firstName, lastName, password, handleResponse ])

  const switchMode = useCallback(() => setMode(mode === Mode.LOGIN ? Mode.REGISTER : Mode.LOGIN), [ mode ])

  return (
    <div id="loginScreen" className="screen" >
      <div id="logoBox">
        <img src="/img/melophony.png" style={{ height: '100%' }} />
        <h1>Melophony</h1>
      </div>
      <div id="loginBox" >
        <div id="loginText" >
          <h2>Login</h2>
          <p>Please provide your username & password to authenticate and get access to your tracks</p>
        </div>
        <div id="loginInputs" >
          <form onSubmit={login} >
            <Field title="Email" id="email" icon="at" onInput={setEmail} />
            <Field title="Password" id="password" icon="key" type="password" onInput={setPassword} />
          </form>
          { errorMessage && <StatusMessage message={errorMessage} type={MessageType.WARNING} /> }
          {
            mode === Mode.LOGIN && (
              <>
                <Button title="Login" icon="sign-in-alt" onClick={login} />
                <Button title="Join the kiwis" icon="kiwi-bird" onClick={switchMode} />
              </>
            )
          }
          {
            mode === Mode.REGISTER && (
              <>
                  <Field title="Repeat your password" id="repeatPassword" icon="key" type="password" onInput={setPassword} />
                  <Field title="First name" id="firstName" icon="user" onInput={setFirstName} />
                  <Field title="Last name" id="lastName" icon="user" onInput={setLastName} />
                  <Button title="Register" icon="thumbs-up" onClick={register} />
                  <Button title="Back to login" icon="sign-in-alt" onClick={switchMode} />
              </>
            )
          }
          <SessionConfigurator />
        </div>
      </div>
    </div>
  )
}

  export default LoginScreen