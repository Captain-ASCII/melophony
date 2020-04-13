
import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { RootState } from '@store'

import { setConfiguration } from '@actions/Configuration'
import { setApiManager } from '@actions/App'

import { selectApiManager } from '@selectors/App'

import Select from '@components/Select'

const SessionConfigurator = ({ onChange }: { onChange?: () => void }): JSX.Element => {

  const dispatch = useDispatch()

  const configuration = useSelector((state: RootState) => state.configuration)
  const apiManager = selectApiManager()

  const displaySessionParameters = useCallback(() => {
    if (document) {
      const element = document.getElementById('sessionParameters')
      if (element) {
        element.style.display = 'flex'
      }
    }
  }, [])

  const configureNetwork = useCallback((value: string) => {
    dispatch(setConfiguration(configuration.withServerAddress(value)))
    dispatch(setApiManager(apiManager.withServerAddress(value)))
    if (onChange) {
      onChange()
    }
  }, [ dispatch, onChange, apiManager, configuration ])

  return (
    <>
      <i id="sessionParametersIcon" onClick={displaySessionParameters} className="fa fa-cog icon button" />
      <div id="sessionParameters">
        <Select
          placeholder="Network configuration"
          icon="network-wired"
          onSelection={configureNetwork}
          >
          <option value="https://melophony.ddns.net" >Online</option>
          <option value="https://192.168.1.18:1951" >Home offline</option>
          <option value="http://localhost:1789" >Local</option>
        </Select>
      </div>
    </>
  )
}

export default SessionConfigurator