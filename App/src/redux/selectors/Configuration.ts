import { useSelector } from 'react-redux'

import { RootState } from '@store'

import Configuration from '@models/Configuration'

export const selectConfiguration = (): Configuration => useSelector((state: RootState) => state.configuration)
