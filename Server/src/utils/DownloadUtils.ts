
import { getConnection } from 'typeorm'
import FileSystem from 'fs'
import YTDL, { videoInfo } from 'ytdl-core'

import Log from '@utils/Log'
import { getListenerConnector, AppEvents } from '@utils/AppEventUtils'

import ApiResult from '@api/ApiResult'

import Artist from '@models/Artist'
import File, { FileState } from '@models/File'
import Track from '@models/Track'
import User from '@models/User'

export default class DownloadUtils {

  public static FILE_DIR = 'files'

  static deleteFile(id: string): void {
    if (FileSystem.existsSync(`${DownloadUtils.FILE_DIR}/${id}.m4a`)) {
      FileSystem.unlinkSync(`${DownloadUtils.FILE_DIR}/${id}.m4a`)
    }
  }

  static checkFilesDir(): void {
    if (!FileSystem.existsSync(DownloadUtils.FILE_DIR)) {
      FileSystem.mkdirSync(DownloadUtils.FILE_DIR)
    }
  }

  static async findArtist(userId: number, artistName: string): Promise<Artist> {
    const artist = await getConnection()
    .getRepository(Artist)
    .createQueryBuilder('artist')
    .where('artist.user = :id', { id: userId })
    .andWhere('artist.name = :name', { name: artistName })
    .getOne()

    if (artist !== undefined) {
      return artist
    }

    const user = await getConnection().getRepository(User).findOne({ id: userId }) || null
    const newArtist = new Artist(artistName, user, [])
    await getConnection().getRepository(Artist).save(newArtist)

    return newArtist
  }

  private static handleResult(result: boolean, trackId: number): ApiResult {
    if (result) {
      return new ApiResult(200, 'Download started', trackId)
    } else {
      return new ApiResult(500, 'There was a problem during download')
    }
  }

  static async downloadFile(userId: number, videoId: string, forceDownload: boolean, track: Track): Promise<ApiResult> {
    DownloadUtils.checkFilesDir()

    const fileRepository = getConnection().getRepository(File)
    let file = await fileRepository.findOne({videoId}, {relations: ['tracks']})
    const fileIsAlreadyCreated = file !== undefined

    if (!file) {
      file = new File(videoId, FileState.UNAVAILABLE, [ track ])
      await fileRepository.save(file)
      Log.d(`Created new file with id: ${videoId} - `, file)
    }

    const setTrackInfo = async function(title: string, duration: number): Promise<void> {
      const parts = title.split(' - ', 2)

      track.file = file
      track.title = parts[1] || title
      track.duration = duration
      track.endTime = duration
      track.artist = await DownloadUtils.findArtist(userId, parts[0])
      await getConnection().getRepository(Track).save(track)
    }

    if (!fileIsAlreadyCreated) {
      if (FileSystem.existsSync(`${DownloadUtils.FILE_DIR}/${videoId}.m4a`)) {
        Log.w('File already downloaded but hasn\'t any File object associated, callback with default values')
        await setTrackInfo('Track issue (file downloaded but info has disappeared), please configure the track', 100)
      } else {
        return DownloadUtils.handleResult(await DownloadUtils.download(videoId, setTrackInfo), track.id)
      }
    } else {
      Log.d(`File already downloaded: (hasRestarted: ${forceDownload})`)

      file.tracks = [ ...file.tracks, track ]
      await getConnection().getRepository(File).save(file)

      if (forceDownload) {
        DownloadUtils.deleteFile(videoId)
        return DownloadUtils.handleResult(await DownloadUtils.download(videoId, setTrackInfo), track.id)
      } else if (file.tracks && file.tracks.length > 0) {
        await setTrackInfo(file.tracks[0].title, file.tracks[0].duration)
        return new ApiResult(200, 'Track already downloaded on server', track.id)
      }
    }

    return new ApiResult(400, 'Track already downloaded', track.id)
  }

  static async download(videoId: string, setTrack: ((title: string, duration: number) => void) | undefined = undefined): Promise<boolean> {
    try {
      const stream = YTDL(`https://www.youtube.com/watch?v=${videoId}`, {filter: (format) => format.mimeType !== undefined && format.mimeType.startsWith('audio/mp4')})

      stream.on('info', (info: videoInfo) => {
        if (setTrack) {
          setTrack(info.player_response.videoDetails.title, info.player_response.videoDetails.lengthSeconds)
        }
      })
      stream.on('progress', (chunk: number, current: number, total: number) => {
        getListenerConnector().notify(AppEvents.DOWNLOAD_PROGRESS, {id: videoId, progress: (current * 100) / total})
      })
      stream.on('end', () => {
        getListenerConnector().notify(AppEvents.DOWNLOAD_END, {id: videoId})
        Log.d(`File ${videoId}.m4a downloaded successfully`)
      })

      stream.pipe(FileSystem.createWriteStream(`${DownloadUtils.FILE_DIR}/${videoId}.m4a`))
      return true

    } catch (error) {
      Log.e('Error during download', error)
    }

    return false
  }

  static async downloadSync(videoId: string): Promise<boolean> {
    try {
      const stream = YTDL(`https://www.youtube.com/watch?v=${videoId}`, {filter: (format) => format.mimeType !== undefined && format.mimeType.startsWith('audio/mp4')})
      const streamPromise = new Promise<boolean>((resolve, reject) => {
        stream.on('info', (info: videoInfo) => Log.i('Got info for track'))
        stream.on('progress', (chunk: number, current: number, total: number) => Log.i(`${current}/${total} [${Math.floor(current*100/total)}%]`))
        stream.on('end', () => {
          Log.i(`File ${videoId}.m4a downloaded successfully`)
          resolve(true)
        })
        stream.on('error', () => reject(false))

        stream.pipe(FileSystem.createWriteStream(`${DownloadUtils.FILE_DIR}/${videoId}.m4a`))
      })
      return await streamPromise
    } catch (error) {
      Log.e('Error during download', error)
    }

    return false
  }
}
