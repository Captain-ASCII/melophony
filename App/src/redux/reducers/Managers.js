import { SET_API_MANAGER, SET_MEDIA_MANAGER } from 'actions/Managers'

const media = (state = {}, action) => {
  switch (action.type) {
    case SET_MEDIA_MANAGER:
      return { ...state, mediaManager: action.mediaManager }
    case SET_API_MANAGER:
      return { ...state, apiManager: action.apiManager }
    default:
      return state
  }
}

export default media
