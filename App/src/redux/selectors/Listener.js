import { useSelector } from 'react-redux'

export const selectListener = id => useSelector(state => state.listeners[id])