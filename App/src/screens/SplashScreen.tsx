import React from 'react'

import SessionConfigurator from '@components/SessionConfigurator'

import ApiManager from '@utils/ApiManager'

const Splash = ({ onNetworkConfiguration }: { onNetworkConfiguration: (apiManager: ApiManager) => void }): JSX.Element => {

  return (
    <div id="splash">
      <img id="splashImg" src="/public/img/melophony.png" />
      <h1 id="splashTitle" >Melophony</h1>
      <SessionConfigurator onChange={onNetworkConfiguration} />
    </div>
  )
}

export default Splash