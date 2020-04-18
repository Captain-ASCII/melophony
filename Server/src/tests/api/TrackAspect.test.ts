
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

  let userId: number

  beforeAll(async () => {
    await TestUtils.connect()

    const result = await new UserAspect().register(new User('trackAspectTest@gmail.com', '', '', 'password', [], [], []))
    userId = result.getData()

    jest.spyOn(DownloadUtils, 'download').mockImplementation(mockDownload)
  })

  afterAll(async () => {
    await TestUtils.disconnect()
  })

  beforeEach(() => aspect = new TrackAspect())

  test('should return an empty tracks array', async () => {
    const result = await aspect.getTracks(userId)
    expect(result.getData()).toEqual([])
  })

  test('should try to download a file', async () => {
    const result = await aspect.createTrack(userId, 'test')
    expect(result.getMessage()).toEqual('Download started')
  })

  test('should get the created track', async () => {
    const creation = await aspect.createTrack(userId, 'test2')
    const trackId = creation.getData()

    const result = await aspect.getTrack(userId, trackId)
    expect(result.getMessage()).toEqual('OK')
    expect(result.getData().title).toEqual('Mocked title')
  })

  test('should get tracks', async () => {
    const result = await aspect.getTracks(userId)
    expect(result.getMessage()).toEqual('OK')

    const tracks = result.getData()
    expect(tracks).toHaveLength(2)
  })

  test('should indicate the file is already downloaded but create new track', async () => {
    const result = await aspect.createTrack(userId, 'test')
    expect(result.getStatus()).toEqual(400)
    expect(result.getMessage()).toEqual('Track already downloaded')
  })

  test('should modify track', async () => {
    const creation = await aspect.createTrack(userId, 'test3')
    const trackId = creation.getData()
    const obtaining = await aspect.getTrack(userId, trackId)
    const track = obtaining.getData() as Track

    track.title = 'New Mocked title'

    const result = await aspect.modifyTrack(userId, trackId, track)
    expect(result.getMessage()).toEqual('Track updated')
    const secondObtaining = await aspect.getTrack(userId, trackId)
    const modifiedTrack = secondObtaining.getData() as Track
    expect(modifiedTrack.title).toEqual('New Mocked title')
  })

  test('should delete track', async () => {
    const creation = await aspect.createTrack(userId, 'a new track')
    const trackId = creation.getData()

    const result = await aspect.deleteTrack(userId, trackId)
    expect(result.getMessage()).toEqual('Track deleted')
    expect(result.getData()).toEqual(1)

    const obtaining = await aspect.getTrack(userId, trackId)
    const noTrack = obtaining.getData() as Track
    expect(obtaining.getStatus()).toEqual(200)
    expect(noTrack).toBeUndefined()
  })
})