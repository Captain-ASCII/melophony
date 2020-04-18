
import DownloadUtils from '@utils/DownloadUtils'
import TestUtils from '@tests/TestUtils'

import ApiResult from '@api/ApiResult'
import ArtistAspect from '@api/ArtistAspect'
import TrackAspect from '@api/TrackAspect'
import UserAspect from '@api/UserAspect'

import Artist from '@models/Artist'
import File from '@models/File'
import Track from '@models/Track'
import User from '@models/User'

async function mockDownload(userId: number, videoId: string, file: File, track: Track): Promise<ApiResult> {
  await DownloadUtils.setTrack(userId, track, file, 'Artist - Title', 100)
  return new ApiResult(200, 'Download started')
}

describe('Test ArtistAspect.ts', () => {

  let userAspect: UserAspect
  let aspect: ArtistAspect
  let trackAspect: TrackAspect

  let userId: number
  let user: User

  beforeAll(async () => {
    await TestUtils.connect()
    userAspect = new UserAspect()

    const result = await userAspect.register(new User('artistAspectTest@gmail.com', '', '', 'password', [], [], []))
    userId = result.getData()
    user = (await userAspect.getUser(userId)).getData() as User
  })

  afterAll(async () => {
    await TestUtils.disconnect()
  })

  beforeEach(() => {
    aspect = new ArtistAspect()
    trackAspect = new TrackAspect()
  })

  test('should create an artist', async () => {
    const creation = await aspect.createArtist(userId, new Artist('a new artist', user, []))
    const artistId = creation.getData()

    const obtaining = await aspect.getArtist(userId, artistId)
    const artist = obtaining.getData() as Artist
    expect(artist.name).toEqual('a new artist')
  })

  test('should create an artist (via track creation)', async done => {
    jest.spyOn(DownloadUtils, 'download').mockImplementation(mockDownload)

    await trackAspect.createTrack(userId, 'test4')

    setTimeout(async () => {
      const result = await aspect.findArtist(userId, 'Artist')
      expect(result.getData()).toHaveLength(1)
      done()
    }, 2000)
  })

  test('should modify an artist', async () => {
    const creation = await aspect.createArtist(userId, new Artist('an artist again', user,  []))
    const artistId = creation.getData()
    const obtaining = await aspect.getArtist(userId, artistId)
    const artist = obtaining.getData() as Artist

    artist.name = 'artist has changed'

    const modification = await aspect.modifyArtist(userId, artistId, artist)
    expect(modification.getData()).toEqual(1)
    const secondObtaining = await aspect.getArtist(userId, artistId)
    const modifiedArtist = secondObtaining.getData() as Artist

    expect(modifiedArtist.name).toEqual('artist has changed')
  })

  test('should not modify an artist that does not belong to this user', async () => {
    const artistName = 'an artist again'

    const result = await new UserAspect().register(new User('artistAspectTest2@gmail.com', '', '', 'password', [], [], []))
    const anotherUserId = result.getData()
    const anotherUser = (await userAspect.getUser(anotherUserId)).getData() as User

    const creation = await aspect.createArtist(anotherUserId, new Artist(artistName, anotherUser,  []))
    const artistId = creation.getData()
    const obtaining = await aspect.getArtist(anotherUserId, artistId)
    const artist = obtaining.getData() as Artist

    artist.name = 'artist has changed'

    const modification = await aspect.modifyArtist(userId, artistId, artist)
    expect(modification.getData()).toEqual(0)
    const secondObtaining = await aspect.getArtist(anotherUserId, artistId)
    const modifiedArtist = secondObtaining.getData() as Artist

    expect(modifiedArtist.name).toEqual(artistName)
  })

  test('should delete an artist', async () => {
    const creation = await aspect.createArtist(userId, new Artist('wow, an artist', user,  []))
    const artistId = creation.getData()

    const firstSearch = await aspect.findArtist(userId, 'wow, an artist')
    expect(firstSearch.getData()).toBeDefined()
    const artist = firstSearch.getData()[0] as Artist
    expect(artist.name).toEqual('wow, an artist')

    const deletion = await aspect.deleteArtist(userId, artistId)
    expect(deletion.getData()).toEqual(1)

    const secondSearch = await aspect.findArtist(userId, 'wow, an artist')
    expect(secondSearch.getData()).toEqual([])
  })
})