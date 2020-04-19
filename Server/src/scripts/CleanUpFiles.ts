
import 'tsconfig-paths/register'

import ProjectConfiguration from '@projectConfiguration'
import FileSystem from 'fs'
import Path from 'path'
import { createConnection } from 'typeorm'

import DownloadUtils from '@utils/DownloadUtils'
import Log from '@utils/Log'

import Track from '@models/Track'

createConnection().then(async connection => {

  const filePath = Path.join(ProjectConfiguration.PROJECT_ROOT, DownloadUtils.FILE_DIR)

  const tracks = await connection.getRepository(Track).find({ relations: [ 'file' ]})
  let files = FileSystem.readdirSync(filePath)
  const missingFiles = []

  for (const track of tracks) {
    if (track.file) {
      const fileName = `${track.file.videoId}.m4a`
      if (!files.includes(fileName)) {
        missingFiles.push(fileName)
        await DownloadUtils.downloadSync(track.file.videoId)
      } else {
        files = files.filter(id => id !== fileName)
      }
    }
  }

  Log.i(`Downloaded ${missingFiles.length} missing files:`, missingFiles)
  Log.i(`Will delete ${files.length} files without tracks:`, files)

  for (const fileName of files) {
    FileSystem.unlinkSync(Path.join(filePath, fileName))
  }

  await connection.close()
}).catch(error => Log.e('Db connection error:', error))
