import { Objects } from 'utils/Immutable'

import { SET_CONFIGURATION, SET_IN_CONFIGURATION } from 'actions/Configuration'

const MELOPHONY_CONFIGURATION = 'melophony-configuration'
const INITIAL_CONFIG = {
  serverAddress: 'https://melophony.ddns.net',
  networkEnabled: true,
  shuffleMode: true,
  sortType: 'date',
  sortOrder: 'ASC',
  displayType: 'itemList'
}

function inflate() {
  const jsonConfiguration = localStorage.getItem(MELOPHONY_CONFIGURATION)
  if (jsonConfiguration) {
    return JSON.parse(jsonConfiguration)
  }
  return INITIAL_CONFIG
}

function store(newConfiguration) {
  localStorage.setItem(MELOPHONY_CONFIGURATION, JSON.stringify(newConfiguration))
  return newConfiguration
}

const configuration = (state = inflate(), action) => {
  switch (action.type) {
    case SET_CONFIGURATION:
      return store(action.configuration)
    case SET_IN_CONFIGURATION:
      return store(Objects.update(state, action.key, action.value))
    default:
      return state
  }
}

export default configuration
