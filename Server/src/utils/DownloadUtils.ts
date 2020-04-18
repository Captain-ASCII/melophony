
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

  static async setTrack(userId: number, track: Track, file: File, title: string, duration: number): Promise<void> {
    const parts = title.split(' - ', 2)

    track.file = file
    track.title = parts[1] || title
    track.duration = duration
    track.endTime = duration
    track.artist = await DownloadUtils.findArtist(userId, parts[0])
    await getConnection().getRepository(Track).save(track)
  }

  static async downloadFile(userId: number, videoId: string, forceDownload: boolean, track: Track): Promise<ApiResult> {
    DownloadUtils.checkFilesDir()

    const fileRepository = getConnection().getRepository(File)
    const result = await fileRepository.findOne({videoId}, {relations: ['tracks']})
    if (!result) {
      const file = new File(videoId, FileState.UNAVAILABLE, [ track ])
      await fileRepository.save(file)
      Log.d(`Created new file with id: ${videoId} - `, file)

      if (FileSystem.existsSync(`${DownloadUtils.FILE_DIR}/${videoId}.m4a`)) {
        Log.w('File already downloaded but hasn\'t any File object associated, callback with default values')
        await DownloadUtils.setTrack(userId, track, file, 'Track issue (file downloaded but info has disappeared), please configure the track', 100)
      } else {
        return DownloadUtils.download(userId, videoId, file, track)
      }
    } else {
      Log.d(`File already downloaded: (hasRestarted: ${forceDownload})`)

      result.tracks = [ ...result.tracks, track ]
      await getConnection().getRepository(File).save(result)

      if (forceDownload) {
        DownloadUtils.deleteFile(videoId)
        return DownloadUtils.download(userId, videoId, result, track)
      } else if (result.tracks && result.tracks.length > 0) {
        await DownloadUtils.setTrack(userId, track, result, result.tracks[0].title, result.tracks[0].duration)
      }
    }

    return new ApiResult(400, 'Track already downloaded')
  }

  static async download(userId: number, videoId: string, file: File, track: Track): Promise<ApiResult> {
    try {
      const stream = YTDL(`https://www.youtube.com/watch?v=${videoId}`, {filter: (format) => format.mimeType !== undefined && format.mimeType.startsWith('audio/mp4')})

      stream.on('info', (info: videoInfo) => {
        DownloadUtils.setTrack(userId, track, file, info.player_response.videoDetails.title, info.player_response.videoDetails.lengthSeconds)
      })
      stream.on('progress', (chunk: number, current: number, total: number) => {
        getListenerConnector().notify(AppEvents.DOWNLOAD_PROGRESS, {id: videoId, progress: (current * 100) / total})
      })
      stream.on('end', () => {
        getListenerConnector().notify(AppEvents.DOWNLOAD_END, {id: videoId})
        Log.d(`File ${videoId}.m4a downloaded successfully`)
      })

      stream.pipe(FileSystem.createWriteStream(`${DownloadUtils.FILE_DIR}/${videoId}.m4a`))
      return new ApiResult(200, 'Download started')
    } catch (error) {
      Log.e('Error during download', error)
      return new ApiResult(500, 'There was a problem during download')
    }
  }
}
