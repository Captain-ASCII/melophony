import { SET_CONFIGURATION } from 'actions/Configuration'

const configuration = (state = {}, action) => {
  switch (action.type) {
    case SET_CONFIGURATION:
      return action.configuration
    default:
      return state
  }
}

export default configuration
