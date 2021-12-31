
import FileSystem from 'fs'
import Path from 'path'
import { getConnection } from 'typeorm'

import ApiAspectUtils from '@utils/ApiAspectUtils'
import DbUtils from '@utils/DbUtils'
import DownloadUtils from '@utils/DownloadUtils'

import File from '@models/File'
import Track from '@models/Track'

import BaseAspect from '@api/BaseAspect'
import ApiResult from '@api/ApiResult'

export default class FileAspect extends BaseAspect {

  constructor() {
    super()

    this.router.post('/file', async (request, response) => {
      const track = await getConnection()
        .getRepository(Track)
        .createQueryBuilder('track')
        .leftJoinAndSelect('track.file', 'file')
        .where('file.videoId = :id',  { id: request.body.videoId })
        .getOne()
      let result = new ApiResult(400, 'File download is reserved for created track, consider POSTing /track')

      if (track) {
        result = await DownloadUtils.downloadFile(request.decoded.userId, request.body.videoId, request.body.forceDownload || false, track)
      }
      this.sendResponse(response, result)
    })

    this.router.get('/file/:videoId', (request, response) => {
      if (FileSystem.existsSync(Path.join(__dirname, '..', '..', DownloadUtils.FILE_DIR, `${request.params.videoId}.m4a`))) {
        response.sendFile(Path.join(__dirname, '..', '..', DownloadUtils.FILE_DIR, `${request.params.videoId}.m4a`))
      } else {
        this.sendResponse(response, new ApiResult(400, `Could not get ${request.params.videoId}.m4a, file does not exist`))
      }
    })

    ApiAspectUtils.associateCRUDOperations(
      this,
      'file',
      null,
      null,
      null,
      this.findFile,
      null,
      this.deleteFile
    )

    // this.router.get('/state/:videoId', (request, response) => {
    //   const progress = 0

    //   if (this.files[request.params.videoId]) {
    //     response.send({
    //       id: this.files[request.params.videoId].id,
    //       state: this.files[request.params.videoId].state,
    //       progress: Math.round(ServerUtils.getDownloadProgress(request.params.videoId, this.files))
    //     })
    //   } else {
    //     response.send({ error: 'id not found' })
    //   }
    // })
  }

  async findFile(userId: number, fileName: string): Promise<ApiResult> {
    return DbUtils.find(File, { name: fileName }, userId)
  }

  async deleteFile(userId: number, fileId: number): Promise<ApiResult> {
    return DbUtils.delete(File, fileId, userId)
  }
}