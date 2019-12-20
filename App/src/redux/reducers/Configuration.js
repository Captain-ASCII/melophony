import { SET_CONFIGURATION } from 'actions/Configuration'

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
    default:
      return state
  }
}

export default configuration
