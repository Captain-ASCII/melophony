import { Objects } from 'utils/Immutable'

import { SET_CONFIGURATION, SET_CONFIGURATION_VALUE } from 'actions/Configuration'

const INITIAL_CONFIG = {
  serverAddress: 'https://melophony.ddns.net',
  networkEnabled: true,
  shuffleMode: true,
  sortType: 'date',
  sortOrder: 'ASC',
  displayType: 'itemList'
}

const configuration = (state = INITIAL_CONFIG, action) => {
  switch (action.type) {
    case SET_CONFIGURATION:
      return action.configuration
    case SET_CONFIGURATION_VALUE:
      return Objects.update(state, action.key, action.value)
    default:
      return state
  }
}

export default configuration
