import React, { useState, useCallback } from 'react'

import StringUtils from '@utils/StringUtils'
import { _ } from '@utils/TranslationUtils'

import { selectApiManager } from '@selectors/App'

import Field from '@components/Field'
import Button from '@components/Button'
import SessionConfigurator from '@components/SessionConfigurator'
import StatusMessage, { MessageType } from '@components/StatusMessage'
import Loader from '@components/Loader'

import ApiManager from '@utils/ApiManager'

enum Mode {
  LOGIN,
  REGISTER
}

const LoginScreen = ({ getRequiredData }: { getRequiredData: (apiManager: ApiManager) => void }): JSX.Element => {
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
      getRequiredData(apiManager)
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
        <h1>Melophony</h1>
      </div>
      <div id="loginBox" >
        <div id="loginText" >
          <h2>{ _("login.screen.title") }</h2>
          <p>{ _("login.notice.subtitle") }</p>
        </div>
        <div id="loginInputs" >
          <form onSubmit={formLogin} >
            <Field title={_("login.user.name.field")} id="userName" icon="user" onInput={setUserName} />
            <Field title={_("login.password.field")} id="password" icon="key" type="password" onInput={setPassword} />
            <input type="submit" style={{display: 'none'}} />
          </form>
          { (loading || errorMessage) &&
            <div id="statusBox">
              { loading && <Loader /> }
              { errorMessage && <StatusMessage message={errorMessage} type={MessageType.WARNING} /> }
            </div>
          }
          {
            mode === Mode.LOGIN && (
              <>
                <Button title={_("login.login.button")} icon="sign-in-alt" onClick={login} />
                <Button title={_("login.register.mode.button")} icon="kiwi-bird" onClick={switchMode} />
              </>
            )
          }
          {
            mode === Mode.REGISTER && (
              <>
                  <Field title={_("login.email.field")} id="email" icon="at" onInput={setEmail} />
                  <Field title={_("login.first.name.field")} id="firstName" icon="user" onInput={setFirstName} />
                  <Field title={_("login.last.name.field")} id="lastName" icon="user" onInput={setLastName} />
                  <Button title={_("login.register.button")} icon="thumbs-up" onClick={register} />
                  <Button title={_("login.back.to.login.button")} icon="sign-in-alt" onClick={switchMode} />
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