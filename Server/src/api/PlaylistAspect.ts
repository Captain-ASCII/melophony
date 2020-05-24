
import ApiAspectUtils from '@utils/ApiAspectUtils'
import DbUtils, { SQLCustomizer, JoinCustomizer, WhereCustomizer } from '@utils/DbUtils'

import Playlist from '@models/Playlist'

import ApiResult from '@api/ApiResult'
import BaseAspect from '@api/BaseAspect'

export default class PlaylistAspect extends BaseAspect {

  constructor() {
    super()

    ApiAspectUtils.associateCRUDOperations(
      this,
      'playlist',
      this.createPlaylist,
      this.getPlaylist,
      this.getPlaylists,
      this.findPlaylist,
      this.modifyPlaylist,
      this.deletePlaylist
    )
  }

  async createPlaylist(userId: number, playlist: Playlist): Promise<ApiResult> {
    return DbUtils.create(Playlist, playlist)
  }

  async getPlaylist(userId: number, id: number): Promise<ApiResult> {
    return DbUtils.read(Playlist, id, SQLCustomizer.merge(SQLCustomizer.getUserIdCustomizer(userId), new SQLCustomizer([ new JoinCustomizer('entity.tracks') ])))
  }

  async getPlaylists(userId: number): Promise<ApiResult> {
    return DbUtils.readAll(Playlist, SQLCustomizer.merge(SQLCustomizer.getUserIdCustomizer(userId), new SQLCustomizer([ new JoinCustomizer('entity.tracks') ])))
  }

  async findPlaylist(userId: number, playlistName: string): Promise<ApiResult> {
    return DbUtils.find(Playlist, { name: playlistName }, userId)
  }

  async modifyPlaylist(userId: number, id: number, playlist: Playlist): Promise<ApiResult> {
    return DbUtils.update(Playlist, id, playlist, userId)
  }

  async deletePlaylist(userId: number, id: number): Promise<ApiResult> {
    return DbUtils.delete(Playlist, id, userId)
  }
}