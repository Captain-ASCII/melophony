
import 'tsconfig-paths/register'

import FS from 'fs'
import { createConnection } from 'typeorm'

import Artist from '@models/Artist'
import File, { FileState } from '@models/File'
import Track from '@models/Track'
import User from '@models/User'
import AuthUtils from '@utils/AuthUtils'
import Playlist from '@models/Playlist'

createConnection().then(async connection => {

  await connection.synchronize(true)

  async function findArtist(artistId: string, artists: Array<any>): Promise<Artist | null> {
    let artistName = ''
    for (const k in artists) {
      if (artists[k].id === artistId) {
        artistName = artists[k].name
        break
      }
    }
    const result = await connection.getRepository(Artist).findOne({ name: artistName })
    if (result) {
      return result
    }

    console.warn(`id without artist: ${artistId}`)
    return null
  }

  async function findFile(fileId: string): Promise<File | null> {
    const result = await connection.getRepository(File).findOne({ videoId: fileId })
    if (result) {
      return result
    }

    console.warn(`file not found with id ${fileId}`)
    return null
  }

  /* MAP Artists */
  const artistsJson = FS.readFileSync(`${__dirname}/data/artists.json`, 'utf8')
  const artists = JSON.parse(artistsJson)
  const artistsArray: Array<Artist> = []

  const user = new User('d.benlulu23@gmail.com', 'Daniel', 'Ben-Lulu', AuthUtils.getHash('=Quepasos*1951'), [], artistsArray, [])
  await connection.getRepository(User).save(user)

  for (const k in artists) {
    const artist = new Artist(artists[k].name, user, [])
    artistsArray.push(artist)
    await connection.getRepository(Artist).save(artist)
  }

  user.artists = artistsArray
  await connection.getRepository(User).save(user)

  /* MAP Files */
  const filesJson = FS.readFileSync(`${__dirname}/data/files.json`, 'utf8')
  const files = JSON.parse(filesJson)

  for (const k in files) {
    const file = new File(files[k].id, files[k].state === 'available' ? FileState.AVAILABLE : FileState.UNAVAILABLE, [])
    await connection.getRepository(File).save(file)
  }

  await connection.getRepository(User).save(user)

  /* MAP Tracks */
  const tracksJson = FS.readFileSync(`${__dirname}/data/tracks.json`, 'utf8')
  const tracks = JSON.parse(tracksJson)
  const tracksArray: Array<Track> = []

  const defaultPlaylist = new Playlist('default', user, [])
  await connection.getRepository(Playlist).save(defaultPlaylist)

  for (const k in tracks) {
    const track = new Track(
      tracks[k].title,
      parseInt(tracks[k].duration),
      user,
      await findArtist(tracks[k].artist, artists),
      null,
      await findFile(tracks[k].videoId),
      [ defaultPlaylist ]
    )
    track.creationDate = new Date(tracks[k].creationDate)
    tracksArray.push(track)
    await connection.getRepository(Track).save(track)
  }

  user.playlists = [ defaultPlaylist ]
  user.tracks = tracksArray
  await connection.getRepository(User).save(user)

  await connection.close()
}).catch(error => console.log(error))


