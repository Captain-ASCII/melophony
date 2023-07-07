
import File from '@models/File'
import { Arrays } from '@utils/Immutable'

export const SET_FILE = 'SET_FILE'
export const SET_FILES = 'SET_FILES'

interface SetFileAction {
  type: typeof SET_FILE;
  id: number;
  file: File;
}

interface SetFilesAction {
  type: typeof SET_FILES;
  files: Array<File>;
}

export const setFile = (file: File): SetFileAction => ({ type: SET_FILE, id: file.getId(), file })
export const setFiles = (files: Array<File>): SetFilesAction => ({ type: SET_FILES, files })

export type FileAction = SetFileAction | SetFilesAction