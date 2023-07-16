import { Arrays } from '@utils/Immutable'

import { SET_FILE, SET_FILES, FileAction } from '@actions/File'

import File from '@models/File'

const files = (state: Array<File> = [], action: FileAction): Array<File> => {
  switch (action.type) {
    case SET_FILE:
      return Arrays.updateWithCondition(state, action.file, file => file.getId() === action.file.getId())
    case SET_FILES:
      return action.files
    default:
      return state
  }
}

export default files
