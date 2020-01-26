import { useSelector } from 'react-redux'

export const selectMediaManager = () => useSelector(state => state.managers.mediaManager)
export const selectApiManager = () => useSelector(state => state.managers.apiManager)