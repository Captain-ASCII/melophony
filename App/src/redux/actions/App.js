
export const SET_CURRENT_TRACK = 'SET_CURRENT_TRACK'
export const SET_PLAYLIST = 'SET_PLAYLIST'

export const setCurrentTrack = track => ({ type: SET_CURRENT_TRACK, track })
export const setPlaylist = playlist => ({ type: SET_PLAYLIST, playlist })
