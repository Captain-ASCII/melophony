import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'

import { setConfiguration } from 'actions/Configuration'

import Select from 'components/Select'

const Splash = ({ getRequiredData }) => {
  const dispatch = useDispatch()

  const configuration = useSelector(state => state.configuration)
  const displaySessionParameters = useCallback(() => document.getElementById('sessionParameters').style.display = 'flex')
  const configureNetwork = useCallback(value => {
    dispatch(setConfiguration({ ...configuration, serverAddress: value }))
    getRequiredData()
  })

  return (
    <div id="splash">
      <i id="sessionParametersIcon" onClick={displaySessionParameters} className="fa fa-cog icon button" />
      <div id="sessionParameters">
        <Select
          id="serverUrl"
          placeholder="Network configuration"
          icon="network-wired"
          onSelection={configureNetwork}
        >
          <option value="https://melophony.ddns.net" >Online</option>
          <option value="https://192.168.1.18:1951" >Offline</option>
          <option value="http://localhost:1958" >Local</option>
        </Select>
      </div>
      <img id="splashImg" src="/img/melophony.png" />
      <h1 id="splashTitle" >Melophony</h1>
    </div>
  )
}

export default Splash

Splash.propTypes = {
  getRequiredData: PropTypes.func.isRequired
}