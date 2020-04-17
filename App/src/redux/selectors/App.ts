import { useSelector } from 'react-redux'

import { RootState } from '@store'

import PlaylistManager from '@models/PlaylistManager'
import MediaManager from '@utils/MediaManager'
import ApiManager from '@utils/ApiManager'

export const selectPlaylist = (): PlaylistManager => useSelector((state: RootState) => state.app.playlist)
export const selectMediaManager = (): MediaManager => useSelector((state: RootState) => state.app.mediaManager)
export const selectApiManager = (): ApiManager => useSelector((state: RootState) => state.app.apiManager)