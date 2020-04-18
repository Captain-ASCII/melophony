
import { getConnection } from 'typeorm'

import AuthUtils from '@utils/AuthUtils'

import User from '@models/User'
import Playlist from '@models/Playlist'

import BaseAspect from '@api/BaseAspect'
import ApiResult from '@api/ApiResult'

export default class UserAspect extends BaseAspect {

  constructor() {
    super()

    this.router.post('/register', async (request, response) =>
      this.sendResponse(response, await this.register(request.body)))

    this.router.get('/user', async (request, response) =>
      this.sendResponse(response, await this.getUser(request.decoded.userId)))

    this.router.put('/user', async (request, response) =>
      this.sendResponse(response, await this.modifyUser(request.decoded.userId, request.body)))

    this.router.delete('/user', async (request, response) =>
      this.sendResponse(response, await this.deleteUser(request.decoded.userId, request.decoded.userId)))
  }

  async register(user: User): Promise<ApiResult> {
    const assertion = User.assertCorrect(user)

    if (assertion.isCorrect()) {
      const userRepository = getConnection().getRepository(User)
      const playlistRepository = getConnection().getRepository(Playlist)

      const result = await userRepository.findOne({ email: user.email })

      if (result === undefined) {
        const realUser = new User(user.email, user.firstName, user.lastName, AuthUtils.getHash(user.password), [], [], [])
        const defaultPlaylist = new Playlist('default', realUser, [])

        realUser.playlists = [ defaultPlaylist ]
        await userRepository.save(realUser)
        await playlistRepository.save(defaultPlaylist)
        return new ApiResult(200, 'User registered successfully', realUser.id)
      }
      return new ApiResult(400, 'Mail already used')
    }
    return new ApiResult(400, 'KO', assertion.getMessages())
  }

  async getUser(userId: number): Promise<ApiResult> {
    const user = await getConnection()
      .createQueryBuilder()
      .select('user')
      .from(User, 'user')
      .where('user.id = :id', { id: userId })
      .getOne()

    if (user) {
      return new ApiResult(200, 'OK', user)
    }
    return new ApiResult(400, 'KO')
  }

  async modifyUser(userId: number, user: User): Promise<ApiResult> {
    return await getConnection()
      .getRepository(User)
      .save(user)
      .then(result => new ApiResult(200, 'User modified', result))
      .catch(error => new ApiResult(400, 'User not modified', error))
  }

  async deleteUser(userId: number, id: number): Promise<ApiResult> {
    if (userId === id) {
      return await getConnection()
        .getRepository(User)
        .createQueryBuilder()
        .delete()
        .where('id = :id', { id: id })
        .execute()
        .then(result => new ApiResult(200, 'User deleted', result.affected))
        .catch(error => new ApiResult(400, 'DB error', error))
    }

    return new ApiResult(400, 'Cannot delete other users if not admin')
  }
}