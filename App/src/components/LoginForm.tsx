import React, { useState, useCallback } from 'react'

import StringUtils from '@utils/StringUtils'
import { _ } from '@utils/TranslationUtils'

import { selectApiManager } from '@selectors/App'

import Field from '@components/Field'
import Button from '@components/Button'
import StatusMessage, { MessageType } from '@components/StatusMessage'
import Loader from '@components/Loader'

enum Mode {
  LOGIN,
  REGISTER
}

const LoginForm = ({ loginOnly, onLoginResponse }: { loginOnly?: boolean; onLoginResponse: ([status, data, message]: [number, any, Headers]) => void }) => {
  const [ mode, setMode ] = useState(Mode.LOGIN)
  const [ loading, setLoading ] = useState(false)
  const [ email, setEmail ] = useState('')
  const [ userName, setUserName ] = useState('')
  const [ password, setPassword ] = useState('')
  const [ firstName, setFirstName ] = useState('')
  const [ lastName, setLastName ] = useState('')
  const [ errorMessage, setErrorMessage ] = useState('')

  const apiManager = selectApiManager()

  const login = useCallback(() => {
    setLoading(true)
    setErrorMessage('')
    apiManager.post('/user/login', { username: userName, password }).then(onLoginResponse)
  }, [ apiManager, userName, password, onLoginResponse ])

  const formLogin = useCallback((event) => {
    event.preventDefault()
    login()
  }, [login])

  const register = useCallback(() => {
    if (StringUtils.notNullNorEmpty(userName) && StringUtils.notNullNorEmpty(password)
    &&  StringUtils.notNullNorEmpty(firstName) && StringUtils.notNullNorEmpty(lastName)) {
      setLoading(true)
      setErrorMessage('')
      apiManager.post('/user', {username: userName, email, first_name: firstName, last_name: lastName, password}).then(onLoginResponse)
    } else {
      setErrorMessage('Please, fill every mandatory fields')
    }
  }, [ apiManager, email, userName, firstName, lastName, password, onLoginResponse ])

  const switchMode = useCallback(() => setMode(mode === Mode.LOGIN ? Mode.REGISTER : Mode.LOGIN), [ mode ])

  return (
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
            { !loginOnly && <Button title={_("login.register.mode.button")} icon="kiwi-bird" onClick={switchMode} /> }
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
    </div>
  )
}

export default LoginForm