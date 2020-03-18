import { useSelector } from 'react-redux'

export const selectPlaylist = () => useSelector(state => state.app.playlist)