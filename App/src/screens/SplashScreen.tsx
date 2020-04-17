import React from 'react'

import SessionConfigurator from '@components/SessionConfigurator'

const Splash = ({ getRequiredData }: { getRequiredData: () => void }): JSX.Element => {

  return (
    <div id="splash">
      <SessionConfigurator onChange={getRequiredData} />
      <img id="splashImg" src="/img/melophony.png" />
      <h1 id="splashTitle" >Melophony</h1>
    </div>
  )
}

export default Splash