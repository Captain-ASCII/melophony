import { useSelector } from 'react-redux'

export const selectCurrentTrack = () => useSelector(state => state.app.currentTrack)