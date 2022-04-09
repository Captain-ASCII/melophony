
import JWT from 'jwt-client'

import { store } from '@store'

import Track from '@models/Track'

import { setPlaylistManager } from '@actions/App'

import { Keys } from '@utils/KeyboardManager'

function doNothing() { }

export default class MediaManager {

  static EXTRACT_DURATION = 2000

  private audio: HTMLAudioElement

  private onPlayPauseCallback: (isPlaying: boolean) => void
  private onPlayDone: () => void
  private onError: (event: ErrorEvent) => any
  private onKey: (event: KeyboardEvent) => void
  private isPlayable: boolean
  private isPlayingExtract: boolean
  private extractTimeout: any

  constructor(audio: HTMLAudioElement = null) {
    this.audio = audio
    this.extractTimeout = null
    this.isPlayable = true
    this.onPlayDone = doNothing
    this.onError = doNothing
    this.onKey = this.handleKey.bind(this)

    document.addEventListener('keydown', this.onKey)
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.code === Keys.PAGE_UP) {
      this.previous()
    } else if (event.code === Keys.P) {
      this.playPause()
    } else if (event.code === Keys.PAGE_DOWN) {
      this.next()
    }
  }

  clone(): MediaManager {
    document.removeEventListener('keydown', this.onKey)
    return new MediaManager(this.audio)
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
      const nextTrackTask = this.getTrackSetTask(track)
      if (this.isPlayable) {
        nextTrackTask()
      } else {
        this.onPlayDone = nextTrackTask
      }
    }
  }

  private getTrackSetTask(track: Track): () => void {
    return () => {
      this.audio.removeEventListener('error', this.onError)
      this.onError = (event: any) => {
        console.error("Error while playing track: ", track.getTitle(), event)
        this.next()
      }
      this.audio.addEventListener('error', this.onError)

      this.isPlayable = false
      this.audio.src = `${store.getState().configuration.getServerAddress()}/api/file/${track.getFile().getVideoId()}?jwt=${JWT.get()}`
      this.audio.currentTime = track.getStartTime()

      this.audio.ontimeupdate = (): void => {
        if (this.audio.currentTime > track.getEndTime()) {
          this.next()
          this.audio.ontimeupdate = null
        }
      }
      this.setElementHTML('currentTrackInfo', `${track.getArtist().getName()} - ${track.getTitle()}`)
      this.onPlayDone = doNothing
    }
  }

  play(): void {
    if (this.audio !== null && this.audio.src !== '') {
      // Reload for token (music is playing, we are considering the user is still there)
      store.getState().app.apiManager.get('/user')

      this.audio.onended = (): void => {
        this.next()
        this.audio.ontimeupdate = null
      }
      this.audio.play().then(() => {
        this.onPlayDone()
      }).catch(error => {
        console.error("Error while playing source: ", this.audio.src, error)
      }).finally(() => {
        this.isPlayable = true
      })
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
    this.audio.pause()
    store.dispatch(setPlaylistManager(store.getState().app.playlist.previous()))
  }

  next(): void {
    this.audio.pause()
    store.dispatch(setPlaylistManager(store.getState().app.playlist.next()))
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

  prepareTrack(track: Track, loadedCallback: () => void): void {
    fetch(`${store.getState().configuration.getServerAddress()}/api/file/${track.getFile().getVideoId()}?jwt=${JWT.get()}`)
    .then((response) => {
      if (response.status === 200) {
        response.blob().then((blob) => {
          const audioBlob = (window.webkitURL || window.URL).createObjectURL(blob)
          this.audio.src = audioBlob
          loadedCallback()
        })
      }
    })
  }

  playExtract(time: number): void {
    if (this.audio !== null) {
      this.audio.onended = (): boolean => false

      this.audio.currentTime = time
      this.audio.play()
      if (this.extractTimeout) {
        clearTimeout(this.extractTimeout)
      }
      this.extractTimeout = setTimeout(() => {
        this.audio.pause()
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
