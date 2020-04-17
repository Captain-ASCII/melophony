
import Track from '@models/Track'

export const SET_TRACKS = 'SET_TRACKS'
export const SET_TRACK = 'SET_TRACK'

interface SetTracksAction {
  type: typeof SET_TRACKS;
  tracks: Array<Track>;
}

interface SetTrackAction {
  type: typeof SET_TRACK;
  track: Track;
}

export const setTracks = (tracks: Array<Track>): SetTracksAction => ({ type: SET_TRACKS, tracks })
export const setTrack = (track: Track): SetTrackAction => ({ type: SET_TRACK, track })

export type TrackAction = SetTracksAction | SetTrackAction