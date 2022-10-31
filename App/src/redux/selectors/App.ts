import { useSelector } from 'react-redux'

import { RootState } from '@store'

import PlaylistManager from '@models/PlaylistManager'
import User from '@models/User'

import MediaManager from '@utils/MediaManager'
import ApiManager from '@utils/ApiManager'
import KeyboardManager from '@utils/KeyboardManager'
import { Language } from '@utils/TranslationUtils'

export const selectPlaylistManager = (): PlaylistManager => useSelector((state: RootState) => state.app.playlist)
export const selectUser = (): User => useSelector((state: RootState) => state.app.user)
export const selectLanguage = (): Language => useSelector((state: RootState) => state.app.language)
export const selectMediaManager = (): MediaManager => useSelector((state: RootState) => state.app.mediaManager)
export const selectApiManager = (): ApiManager => useSelector((state: RootState) => state.app.apiManager)
export const selectKeyboardManager = (): KeyboardManager => useSelector((state: RootState) => state.app.keyboardManager)