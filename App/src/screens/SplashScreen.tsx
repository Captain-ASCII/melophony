import React from 'react'

import SessionConfigurator from '@components/SessionConfigurator'

const Splash = ({ getRequiredData }: { getRequiredData: () => void }): JSX.Element => {

  return (
    <div id="splash">
      <img id="splashImg" src="/img/melophony.png" />
      <h1 id="splashTitle" >Melophony</h1>
      <SessionConfigurator onChange={getRequiredData} />
    </div>
  )
}

export default Splash