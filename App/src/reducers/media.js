import { PLAY, SET_MEDIA_MANAGER } from 'actions/media'

const media = (state = {}, action) => {
  switch (action.type) {
    case SET_MEDIA_MANAGER:
      return { ...state, manager: action.mediaManager }
    case PLAY:
      state.mediaManager.play()
      return { ...state, status: 'PLAY' }
    default:
      return state
  }
}

export default media
