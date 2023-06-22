
import { SET_CONFIGURATION, ConfigurationAction } from '@actions/Configuration'

import Log from '@utils/Log'

import Configuration from '@models/Configuration'

import { EN_TRANSLATION_KEY } from '@utils/TranslationUtils'

const MELOPHONY_CONFIGURATION = 'melophony-configuration'
const INITIAL_CONFIG = new Configuration('https://melophony.ddns.net', true, true, 'date', 'ASC', 'itemList', EN_TRANSLATION_KEY, false)

function inflate(): Configuration {
  const jsonConfiguration = localStorage.getItem(MELOPHONY_CONFIGURATION)
  if (jsonConfiguration) {
    try {
      const c: any = JSON.parse(jsonConfiguration)
      return new Configuration(
        c.serverAddress || 'https://melophony.ddns.net',
        c.networkEnabled || true,
        c.shuffleMode || true,
        c.sortType || 'date',
        c.sortOrder || 'ASC',
        c.displayType || 'itemList',
        c.language || EN_TRANSLATION_KEY,
        c.keyboardNavEnabled || false
      )
    } catch (error) {
      const errorLog: any = error
      Log.e('Unable to parse configuration', errorLog)
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
