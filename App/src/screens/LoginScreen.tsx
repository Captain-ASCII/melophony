import React, { useState, useCallback } from 'react'

import StringUtils from '@utils/StringUtils'

import { selectApiManager } from '@selectors/App'

import Field from '@components/Field'
import Button from '@components/Button'
import SessionConfigurator from '@components/SessionConfigurator'
import StatusMessage, { MessageType } from '@components/StatusMessage'

enum Mode {
  LOGIN,
  REGISTER
}

const LoginScreen = ({ getRequiredData }: { getRequiredData: () => void }): JSX.Element => {


  const [ mode, setMode ] = useState(Mode.LOGIN)
  const [ loading, setLoading ] = useState(false)
  const [ email, setEmail ] = useState('')
  const [ userName, setUserName ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ firstName, setFirstName ] = useState('')
  const [ lastName, setLastName ] = useState('')
  const [ errorMessage, setErrorMessage ] = useState('')

  const apiManager = selectApiManager()

  const handleResponse = useCallback(([status, data, message]) => {
    if (status !== 200 && status !== 201) {
      setLoading(false)
      setErrorMessage(message)
    } else if (apiManager.hasValidToken()) {
      getRequiredData()
    }
  }, [ getRequiredData ])

  const login = useCallback(() => {
    setLoading(true)
    setErrorMessage('')
    apiManager.post('/login', { userName, password }).then(handleResponse)
  }, [ apiManager, userName, password, handleResponse ])

  const formLogin = useCallback((event) => {
    event.preventDefault()
    login()
  }, [login])

  const register = useCallback(() => {
    if (StringUtils.notNullNorEmpty(userName) && StringUtils.notNullNorEmpty(password)
    &&  StringUtils.notNullNorEmpty(firstName) && StringUtils.notNullNorEmpty(lastName)) {
      setLoading(true)
      setErrorMessage('')
      apiManager.post('/register', { userName, email, firstName, lastName, password }).then(handleResponse)
    } else {
      setErrorMessage('Please, fill every mandatory fields')
    }
  }, [ apiManager, email, userName, firstName, lastName, password, handleResponse ])

  const switchMode = useCallback(() => setMode(mode === Mode.LOGIN ? Mode.REGISTER : Mode.LOGIN), [ mode ])

  return (
    <div id="loginScreen" className="screen" >
      <div id="logoBox">
        <img src="/public/img/melophony.png" />
        <h1>Melophony</h1>r()
      </div>
      <div id="loginBox" >
        <div id="loginText" >
          <h2>Login</h2>
          <p>Please provide your username & password to authenticate and get access to your tracks</p>
        </div>
        <div id="loginInputs" >
          <form onSubmit={formLogin} >
            <Field title="User name" id="userName" icon="user" onInput={setUserName} />
            <Field title="Password" id="password" icon="key" type="password" onInput={setPassword} />
            <input type="submit" style={{display: 'none'}} />
          </form>
          { (loading || errorMessage) &&
            <div id="statusBox">
              { loading && <div id="loadingBox" ><img src="/public/img/loading.gif" id="loadingGif" /></div> }
              { errorMessage && <StatusMessage message={errorMessage} type={MessageType.WARNING} /> }
            </div>
          }
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
                  <Field title="Email (optional)" id="email" icon="at" onInput={setEmail} />
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