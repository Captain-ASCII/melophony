
import React, { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { RootState } from '@store'

import { setConfiguration } from '@actions/Configuration'
import { setApiManager } from '@actions/App'

import { selectApiManager } from '@selectors/App'

import Select from '@components/Select'
import Button from '@components/Button'

import ApiManager from '@utils/ApiManager'
import { _ } from '@utils/TranslationUtils'

const SessionConfigurator = ({ onChange }: { onChange?: (apiManager: ApiManager) => void }): JSX.Element => {

  const dispatch = useDispatch()

  const configuration = useSelector((state: RootState) => state.configuration)
  const apiManager = selectApiManager()

  const displaySessionParameters = useCallback(() => {
    if (document) {
      const element = document.getElementById('sessionParameters')
      if (element) {
        if (element.style.display === 'flex') {
            element.style.display = 'none'
        } else {
            element.style.display = 'flex'
        }
      }
    }
  }, [])

  const configureNetwork = useCallback((value: string) => {
    const newApiManager = apiManager.withServerAddress(value)
    dispatch(setConfiguration(configuration.withServerAddress(value)))
    dispatch(setApiManager(newApiManager))
    if (onChange) {
      onChange(newApiManager)
    }
  }, [ dispatch, onChange, apiManager, configuration ])

  return (
    <>
      <Button id="sessionParametersIcon" onClick={displaySessionParameters} icon="cog" />
      <div id="sessionParameters">
        <Select
          placeholder={_("login.network.configuration.select.placeholder")}
          icon="network-wired"
          onSelection={configureNetwork}
          >
          <option value="https://melophony.ddns.net" >{ _("login.network.configuration.full.online") }</option>
          <option value="https://melophony.ddns.net:1804" >{ _("login.network.configuration.home.online") }</option>
          <option value="http://localhost:1804" >{ _("login.network.configuration.full.local") }</option>
        </Select>
      </div>
    </>
  )
}

export default SessionConfigurator
