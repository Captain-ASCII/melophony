
import DownloadUtils from '@utils/DownloadUtils'
import TestUtils from '@tests/TestUtils'

import PlaylistAspect from '@api/PlaylistAspect'
import TrackAspect from '@api/TrackAspect'
import UserAspect from '@api/UserAspect'

import Playlist from '@models/Playlist'
import Track from '@models/Track'
import User from '@models/User'

function mockDownloadFunction(mockedTitle = 'Mocked title') {
  return async function(videoId: string, setTrack: ((title: string, duration: number) => void) | undefined): Promise<boolean> {
    if (setTrack) {
      await setTrack(mockedTitle, 100)
    }
    return true
  }
}

describe('Test PlaylistAspect.ts', () => {

  let aspect: PlaylistAspect
  let trackAspect: TrackAspect

  let userId: number
  let playlistId: number

  beforeAll(async () => {
    await TestUtils.connect()

    const result = await new UserAspect().register(new User('playlistAspectTest@gmail.com', '', '', 'password', [], [], []))
    userId = result.getData()

    jest.spyOn(DownloadUtils, 'download').mockImplementation(mockDownloadFunction())
  })

  afterAll(async () => {
    await TestUtils.disconnect()
  })

  beforeEach(() => {
    aspect = new PlaylistAspect()
    trackAspect = new TrackAspect()
  })

  const getPlaylists = async (): Promise<Array<Playlist>> => {
    const result = await aspect.getPlaylists(userId)
    return result.getData()
  }

  test('should get default playlist', async () => {
    await trackAspect.createTrack(userId, 'playlistTest')
    expect((await getPlaylists())[0].tracks.length).toEqual(1)

    await trackAspect.createTrack(userId, 'playlistTest2')
    expect((await getPlaylists())[0].tracks.length).toEqual(2)
  })

  test('should create a new playlist', async () => {
    const user = (await new UserAspect().getUser(userId)).getData() as User
    playlistId = (await aspect.createPlaylist(userId, new Playlist('a new playlist', user, []))).getData()

    expect((await getPlaylists()).length).toEqual(2)
    expect((await getPlaylists())[1].tracks.length).toEqual(0)
  })

  test('should add a track to default playlist only', async () => {
    await trackAspect.createTrack(userId, 'playlistTest2')
    expect((await getPlaylists())[0].tracks.length).toEqual(3)
    expect((await getPlaylists())[1].tracks.length).toEqual(0)
  })

  test('should add track to second playlist', async () => {
    const trackTitle = 'playlistTest3'
    jest.spyOn(DownloadUtils, 'download').mockImplementation(mockDownloadFunction(trackTitle))

    const trackId = (await trackAspect.createTrack(userId, trackTitle)).getData()
    const track =  (await trackAspect.getTrack(userId, trackId)).getData() as Track
    const playlist = (await aspect.getPlaylist(userId, playlistId)).getData()

    playlist.tracks = [ ...playlist.tracks, track ]

    await aspect.modifyPlaylist(userId, playlistId, playlist)
    const tracks = (await getPlaylists())[1].tracks

    expect(tracks.length).toEqual(1)
    expect(tracks[0].title).toEqual(trackTitle)
  })

  test('should delete playlist', async () => {
    const deletion = (await aspect.deletePlaylist(userId, playlistId)).getData()

    expect(deletion).toEqual(1)
    expect((await getPlaylists()).length).toEqual(1)
  })
})