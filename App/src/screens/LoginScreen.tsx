import React, { useCallback } from 'react'

import { _ } from '@utils/TranslationUtils'

import { selectApiManager } from '@selectors/App'

import SessionConfigurator from '@components/SessionConfigurator'
import LoginForm from '@components/LoginForm'

import ApiManager from '@utils/ApiManager'

const LoginScreen = ({ getRequiredData }: { getRequiredData: (apiManager: ApiManager, userId: number) => void }): JSX.Element => {
  const apiManager = selectApiManager()

  const handleResponse = useCallback(([status, data, headers]) => {
    if (apiManager.hasValidToken()) {
      getRequiredData(apiManager, data['id'])
    }
  }, [ getRequiredData ])

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
        <LoginForm onLoginResponse={handleResponse} />
        <SessionConfigurator />
      </div>
    </div>
  )
}

  export default LoginScreen