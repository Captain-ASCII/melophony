
import { SET_CONFIGURATION, ConfigurationAction } from '@actions/Configuration'

import Log from '@utils/Log'

import Configuration from '@models/Configuration'

const MELOPHONY_CONFIGURATION = 'melophony-configuration'
const INITIAL_CONFIG = new Configuration('https://melophony-api.ddns.net', true, true, 'date', 'ASC', 'itemList')

function inflate(): Configuration {
  const jsonConfiguration = localStorage.getItem(MELOPHONY_CONFIGURATION)
  if (jsonConfiguration) {
    try {
      const c: any = JSON.parse(jsonConfiguration)
      return new Configuration(
        c.serverAddress,
        c.networkEnabled,
        c.shuffleMode,
        c.sortType,
        c.sortOrder,
        c.displayType
      )
    } catch (error) {
      Log.e('Unable to parse configuration', error)
    }
  }
  return INITIAL_CONFIG
}

function store(newConfiguration: Configuration): Configuration {
  localStorage.setItem(MELOPHONY_CONFIGURATION, JSON.stringify(newConfiguration))
  return newConfiguration
}

const configuration = (state = inflate(), action: ConfigurationAction): Configuration => {
  switch (action.type) {
    case SET_CONFIGURATION:
      return store(action.configuration)
    default:
      return state
  }
}

export default configuration
