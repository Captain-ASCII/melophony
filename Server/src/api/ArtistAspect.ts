
import Artist from '@models/Artist'

import BaseAspect from '@api/BaseAspect'
import ApiResult from './ApiResult'
import DbUtils from '@utils/DbUtils'
import ApiAspectUtils from '@utils/ApiAspectUtils'

export default class ArtistAspect extends BaseAspect {

  constructor() {
    super()

    this.router.post('/artist', async (request, response) => this.sendResponse(response, await this.createArtist(request.decoded.userId, request.body)))

    this.router.get('/artist/search/:name', async (request, response) => {
      this.sendResponse(response, await this.findArtist(request.decoded.userId, request.params.name))
    })

    ApiAspectUtils.associateCRUDOperations(
      this,
      'artist',
      this.createArtist,
      this.getArtist,
      this.getArtists,
      this.findArtist,
      this.modifyArtist,
      this.deleteArtist
    )

    // this.app.get('/artists/tracks', (request, response) => {
    //   const result = {}
    //   for (const i in this.artists) {
    //     for (const track of Object.values(this.tracks)) {
    //       if (i == track.artist) {
    //         if (!result[i]) {
    //           result[i] = this.artists[i]
    //           result[i].tracks = []
    //         }
    //         result[i].tracks.push(track)
    //       }
    //     }
    //   }
    //   response.send(result)
    // })
  }

  async createArtist(userId: number, artist: Artist): Promise<ApiResult> {
    return DbUtils.create(Artist, artist)
  }

  async getArtist(userId: number, id: number): Promise<ApiResult> {
    return DbUtils.read(Artist, id, userId)
  }

  async getArtists(userId: number): Promise<ApiResult> {
    return DbUtils.readAll(Artist, userId)
  }

  async findArtist(userId: number, artistName: string): Promise<ApiResult> {
    return DbUtils.find(Artist, { name: artistName }, userId)
  }

  async modifyArtist(userId: number, id: number, artist: Artist): Promise<ApiResult> {
    return DbUtils.update(Artist, id, artist, userId)
  }

  async deleteArtist(userId: number, id: number): Promise<ApiResult> {
    return DbUtils.delete(Artist, id, userId)
  }
}