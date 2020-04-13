import { SET_TRACKS, TrackAction } from '@actions/Track'

import Track from '@models/Track'

const tracks = (state: Array<Track> = [], action: TrackAction): Array<Track> => {
  switch (action.type) {
    case SET_TRACKS:
      return action.tracks
    default:
      return state
  }
}

export default tracks
