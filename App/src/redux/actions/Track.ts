
import Track from '@models/Track'

export const SET_TRACKS = 'SET_TRACKS'

interface SetTrackAction {
  type: typeof SET_TRACKS;
  tracks: Array<Track>;
}

export const setTracks = (tracks: Array<Track>): SetTrackAction => ({ type: SET_TRACKS, tracks })

export type TrackAction = SetTrackAction