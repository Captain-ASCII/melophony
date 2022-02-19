
import JWT from 'jwt-client'

import { store } from '@store'

import Track from '@models/Track'

import { setPlaylistManager } from '@actions/App'

import { Keys } from '@utils/KeyboardManager'

export default class MediaManager {

  static EXTRACT_DURATION = 2000

  private audio: HTMLAudioElement

  private onPlayPauseCallback: (isPlaying: boolean) => void
  private isPlayingExtract: boolean
  private extractTimeout: any

  constructor(audio: HTMLAudioElement = null, isPlayingExtract = false) {
    this.audio = audio
    this.isPlayingExtract = isPlayingExtract
    this.extractTimeout = null

    document.addEventListener('keydown', (event: any): void => {
      if (event.code === Keys.PAGE_UP) {
        this.previous()
      } else if (event.code === Keys.PAGE_DOWN) {
        this.next()
      }
    })
  }

  clone(): MediaManager {
    return new MediaManager(this.audio, this.isPlayingExtract)
  }

  withAudio(audio: HTMLAudioElement): MediaManager {
    const clone = this.clone()

    /* eslint-disable */
    // @ts-ignore
    audio.toJSON = function () {
      return 'HTMLAudioElement'
    }
    /* eslint-enable */

    clone.audio = audio
    return clone
  }

  onPlayPause(onPlayPauseCallback: (isPlaying: boolean) => void): MediaManager {
    this.onPlayPauseCallback = onPlayPauseCallback
    return this
  }

  setElementHTML(id: string, value: string): void {
    if (document !== undefined) {
      const element = document.getElementById(id)
      if (element) {
        element.innerHTML = value
      }
    }
  }

  setTrack(track: Track | null): void {
    if (this.audio !== null && track !== null) {
      this.audio.addEventListener('error', (event: any) => {
        if (event.target.error && event.target.error.code == 4) {
          this.next()
        }
      })

      this.audio.src = `${store.getState().configuration.getServerAddress()}/file/${track.getFile().getVideoId()}?jwt=${JWT.get()}`
      this.audio.currentTime = track.getStartTime()

      this.audio.ontimeupdate = (): void => {
        if (this.audio.currentTime > track.getEndTime()) {
          this.next()
        }
      }
      this.setElementHTML('currentTrackInfo', `${track.getArtist().getName()} - ${track.getTitle()}`)
    }
  }

  play(): void {
    if (this.audio !== null && this.audio.src !== '') {
      // Reload for token (music is playing, we are considering the user is still there)
      store.getState().app.apiManager.get('/user')

      this.audio.onended = (): void => {
        this.next()
      }
      this.audio.play()
    }
    if (this.onPlayPauseCallback) {
      this.onPlayPauseCallback(true)
    }
  }

  pause(): void {
    if (this.audio !== null) {
      this.audio.pause()
    }
    if (this.onPlayPauseCallback) {
      this.onPlayPauseCallback(false)
    }
  }

  previous(): void {
    store.dispatch(setPlaylistManager(store.getState().app.playlist.previous()))
    this.setTrack(store.getState().app.playlist.getCurrent())
    this.play()
  }

  next(): void {
    store.dispatch(setPlaylistManager(store.getState().app.playlist.next()))
    this.setTrack(store.getState().app.playlist.getCurrent())
    this.play()
  }

  playPause(): void {
    if (this.audio !== null && this.audio.paused) {
      this.play()
    } else {
      this.pause()
    }
    if (this.onPlayPauseCallback) {
      this.onPlayPauseCallback(this.audio === null || !this.audio.paused)
    }
  }

  playExtract(track: Track, time: number): void {
    if (this.audio !== null) {
      this.audio.onended = (): boolean => false

      if (!this.isPlayingExtract) {
        this.audio.src = `${store.getState().configuration.getServerAddress()}/file/${track.getFile().getVideoId()}?jwt=${JWT.get()}`
        this.isPlayingExtract = true
      }
      this.audio.currentTime = time
      this.audio.play()
      if (this.extractTimeout) {
        clearTimeout(this.extractTimeout)
      }
      this.extractTimeout = setTimeout(() => {
        this.audio.pause()
        this.isPlayingExtract = false
      }, MediaManager.EXTRACT_DURATION)
    }
  }

  isPlaying(): boolean {
    if (this.audio) {
      return ! this.audio.paused
    }
    return false
  }
}
