import { SET_TRACKS, SET_TRACK, TrackAction } from '@actions/Track'

import { Arrays } from '@utils/Immutable'

import Track from '@models/Track'

const tracks = (state: Array<Track> = [], action: TrackAction): Array<Track> => {
  switch (action.type) {
    case SET_TRACKS:
      return action.tracks
    case SET_TRACK:
      return Arrays.updateWithCondition(state, action.track, track => track.getId() === action.track.getId())
    default:
      return state
  }
}

export default tracks
