import { useSelector } from 'react-redux'

export const selectConfiguration = () => useSelector(state => state.configuration)
