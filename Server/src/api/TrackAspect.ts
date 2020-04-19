
import { getConnection } from 'typeorm'

import ApiAspectUtils from '@utils/ApiAspectUtils'
import DownloadUtils from '@utils/DownloadUtils'
import Log from '@utils/Log'

import Playlist from '@models/Playlist'
import Track from '@models/Track'
import User from '@models/User'

import ApiResult from '@api/ApiResult'
import BaseAspect from '@api/BaseAspect'
import DbUtils from '@utils/DbUtils'

export default class TrackAspect extends BaseAspect {

  constructor() {
    super()

    this.router.post('/track', async (request, response) =>
      this.sendResponse(response, await this.createTrack(request.decoded.userId, request.body.videoId)))

    ApiAspectUtils.associateCRUDOperations(
      this,
      'track',
      null,
      this.getTrack,
      this.getTracks,
      null,
      this.modifyTrack,
      this.deleteTrack
    )
  }

  async createTrack(userId: number, videoId: string): Promise<ApiResult> {
    if (videoId) {
      const user = await getConnection().getRepository(User).findOne({ id: userId }, { relations: [ 'playlists' ] })
      if (user !== undefined) {
        const track = new Track('', 0, user, null, null, null, [ user.playlists[0] ])
        Log.d(`Created new track (title: ${track.title}, duration: ${track.duration})`)

        const trackCreation = await DbUtils.create(Track, track)
        const result = await DownloadUtils.downloadFile(userId, videoId, false, track)
        return new ApiResult(result.getStatus(), result.getMessage(), trackCreation.getData())
      }
      return new ApiResult(401, 'Unauthorized')
    }
    return new ApiResult(400, 'No videoId provided')
  }

  async getTrack(userId: number, trackId: number): Promise<ApiResult> {
    return DbUtils.read(Track, trackId, userId)
  }

  async getTracks(userId: number): Promise<ApiResult> {
    const playlist = await getConnection()
      .getRepository(Playlist)
      .createQueryBuilder('playlist')
      .leftJoinAndSelect('playlist.user', 'user')
      .leftJoinAndSelect('playlist.tracks', 'tracks')
      .leftJoinAndSelect('tracks.artist', 'artist')
      .leftJoinAndSelect('tracks.file', 'file')
      .where('user.id = :id', { id: userId })
      .getOne()

    if (playlist) {
      return new ApiResult(200, 'OK', playlist.tracks)
    }

    return new ApiResult(204, 'No user, no content')
  }

  async modifyTrack(userId: number, trackId: number, track: Track): Promise<ApiResult> {
    return DbUtils.update(Track, trackId, track, userId)
  }

  async deleteTrack(userId: number, trackId: number): Promise<ApiResult> {
    return DbUtils.delete(Track, trackId, userId)
  }
}