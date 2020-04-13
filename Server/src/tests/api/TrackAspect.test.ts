
import DownloadUtils from '@utils/DownloadUtils'
import TestUtils from '@tests/TestUtils'

import ApiResult from '@api/ApiResult'
import TrackAspect from '@api/TrackAspect'
import UserAspect from '@api/UserAspect'

import File from '@models/File'
import Track from '@models/Track'
import User from '@models/User'

async function mockDownload(userId: number, videoId: string, file: File, track: Track): Promise<ApiResult> {
  await DownloadUtils.setTrack(userId, track, file, 'Mocked title', 100)
  return new ApiResult(200, 'Download started')
}

describe('Test TrackAspect.ts', () => {

  let aspect: TrackAspect

  let user: User

  beforeAll(async () => {
    await TestUtils.connect()

    const result = await new UserAspect().register(new User('trackAspectTest@gmail.com', '', '', 'password', [], [], []))
    user = result.getData() as User

    jest.spyOn(DownloadUtils, 'download').mockImplementation(mockDownload)
  })

  afterAll(async () => {
    await TestUtils.disconnect()
  })

  beforeEach(() => aspect = new TrackAspect())

  test('should return an empty tracks array', async () => {
    const result = await aspect.getTracks(user.id)
    expect(result.getData()).toEqual([])
  })

  test('should try to download a file', async () => {
    const result = await aspect.createTrack(user.id, 'test')
    expect(result.getMessage()).toEqual('Download started')
  })

  test('should get the created track', async () => {
    const creation = await aspect.createTrack(user.id, 'test2')
    const trackId = creation.getData()

    const result = await aspect.getTrack(user.id, trackId)
    expect(result.getMessage()).toEqual('OK')
    expect(result.getData().title).toEqual('Mocked title')
  })

  test('should get tracks', async () => {
    const result = await aspect.getTracks(user.id)
    expect(result.getMessage()).toEqual('OK')

    const tracks = result.getData()
    expect(tracks).toHaveLength(2)
  })

  test('should indicate the file is already downloaded but create new track', async () => {
    const result = await aspect.createTrack(user.id, 'test')
    expect(result.getStatus()).toEqual(400)
    expect(result.getMessage()).toEqual('Track already downloaded')
  })

  test('should modify track', async () => {
    const creation = await aspect.createTrack(user.id, 'test3')
    const trackId = creation.getData()
    const obtaining = await aspect.getTrack(user.id, trackId)
    const track = obtaining.getData() as Track

    track.title = 'New Mocked title'

    const result = await aspect.modifyTrack(user.id, trackId, track)
    expect(result.getMessage()).toEqual('OK')
    const secondObtaining = await aspect.getTrack(user.id, trackId)
    const modifiedTrack = secondObtaining.getData() as Track
    expect(modifiedTrack.title).toEqual('New Mocked title')
  })

  test('should delete track', async () => {
    const creation = await aspect.createTrack(user.id, 'a new track')
    const trackId = creation.getData()

    const result = await aspect.deleteTrack(user.id, trackId)
    expect(result.getMessage()).toEqual('OK')
    expect(result.getData()).toEqual(1)

    const obtaining = await aspect.getTrack(user.id, trackId)
    const noTrack = obtaining.getData() as Track
    expect(obtaining.getStatus()).toEqual(200)
    expect(noTrack).toBeUndefined()
  })
})