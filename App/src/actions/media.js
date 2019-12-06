
export const PLAY = 'MEDIA_PLAY'
export const SET_MEDIA_MANAGER = 'SET_MEDIA_MANAGER'

export const setMediaManager = mediaManager => ({ type: SET_MEDIA_MANAGER, mediaManager })

export const play = () => ({ type: PLAY })