import { useSelector } from 'react-redux'

import { RootState } from '@store'

import File from '@models/File'

export const selectFiles = (): Array<File> => useSelector((state: RootState) => state.files)