
import JWT from 'jwt-client'

import { store } from '@store'

import Track from '@models/Track'

import { setPlaylistManager } from '@actions/App'

import MediaUtils from '@utils/MediaUtils'
import Log from '@utils/Log'
import { Keys } from '@utils/KeyboardManager'

function doNothing() { }

export default class MediaManager {

  static EXTRACT_DURATION = 2000
  static PREVIOUS_TRACK_ACTION = 'PREVIOUS'
  static PLAY_PAUSE_ACTION = 'PLAY_PAUSE'
  static PLAY_ACTION = 'PLAY'
  static PAUSE_ACTION = 'PAUSE'
  static NEXT_TRACK_ACTION = 'NEXT'

  private audio: HTMLAudioElement

  private onPlayPauseCallback: (isPlaying: boolean, title: string, artistName: string) => void
  private onPlayDone: () => void
  private onError: (event: ErrorEvent) => any
  private onKey: (event: KeyboardEvent) => void
  private isPlayable: boolean
  private isPlayingExtract: boolean
  private extractTimeout: any
  private hasPlayedOnce: boolean
  private currentTrack: Track

  constructor(audio: HTMLAudioElement = null) {
    this.audio = audio
    this.extractTimeout = null
    this.isPlayable = true
    this.onPlayDone = doNothing
    this.onError = doNothing
    this.onKey = this.handleKey.bind(this)
    this.hasPlayedOnce = false

    document.addEventListener('keydown', this.onKey)
  }

  private handleKey(event: KeyboardEvent): void {
    if (event.ctrlKey && event.code === Keys.PREVIOUS) {
      this.previous()
    } else if (event.ctrlKey && event.code === Keys.PLAY_PAUSE) {
      this.playPause()
    } else if (event.ctrlKey && event.code === Keys.NEXT) {
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

  onPlayPause(onPlayPauseCallback: (isPlaying: boolean, title: string, artistName: string) => void): MediaManager {
    this.onPlayPauseCallback = onPlayPauseCallback
    return this
  }

  setElementHTML(id: string, value: string): void {
    if (document !== undefined) {
      const element = document.getElementById(id)
      if (element) {
        const nbElements = MediaUtils.isThinMobileScreen() ? 4 : 1
        element.innerHTML = null
        for (let i = 0; i < nbElements; i++) {
          const pTag = document.createElement('p')
          pTag.innerHTML = value
          element.append(pTag)
        }
      }
    }
  }

  setTrack(track: Track | null): void {
    if (this.audio !== null && track !== null) {
      this.currentTrack = track
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
        Log.e(`Error while playing track: ${track.getTitle()}`, event)
        this.next()
      }
      this.audio.addEventListener('error', this.onError)

      this.isPlayable = false
      this.audio.src = `${store.getState().configuration.getServerAddress()}/api/file/${track.getFile().getId()}/download/?jwt=${JWT.get()}`
      if (!store.getState().configuration.isPartialDownloadEnabled()) {
        this.audio.src += '&full=true'
      }
      this.audio.currentTime = track.getStartTime()

      this.audio.ontimeupdate = (): void => {
        if (this.audio.currentTime > track.getEndTime()) {
          this.next()
          this.audio.ontimeupdate = null
        }
      }
      this.onPlayDone = doNothing
    }
  }

  play(): void {
    if (this.audio !== null && this.audio.src !== '') {
      // Reload for token (music is playing, we are considering the user is still there)
      // store.getState().app.apiManager.get('/user')
      if (!this.hasPlayedOnce) {
        MediaUtils.raiseFooterOnMobile()
      }
      this.hasPlayedOnce = true

      this.audio.onended = (): void => {
        this.next()
        this.audio.ontimeupdate = null
      }
      this.audio.play().then(() => {
        this.onPlayDone()
      }).catch(error => {
        Log.e(`Error while playing source: ${this.audio.src}`, error)
      }).finally(() => {
        this.isPlayable = true
      })
    }
    if (this.onPlayPauseCallback) {
      this.onPlayPauseCallback(true, this.currentTrack.getTitle(), this.currentTrack.getArtist().getName())
    }
  }

  pause(): void {
    if (this.audio !== null) {
      this.audio.pause()
    }
    if (this.onPlayPauseCallback) {
      this.onPlayPauseCallback(false, this.currentTrack.getTitle(), this.currentTrack.getArtist().getName())
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

  rewind(): void {
    if (this.audio !== null) {
      this.audio.currentTime -= 10
    }
  }

  goForward(): void {
    if (this.audio !== null) {
      this.audio.currentTime += 10
    }
  }

  playPause(): void {
    if (this.audio !== null && this.audio.paused) {
      this.play()
    } else {
      this.pause()
    }
  }

  prepareTrack(track: Track, loadedCallback: () => void): void {
    fetch(`${store.getState().configuration.getServerAddress()}/api/file/${track.getFile().getId()}/download?full=true&jwt=${JWT.get()}`)
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

  handleCommand(action: string): void {
    if (MediaManager.PREVIOUS_TRACK_ACTION === action) {
      this.previous()
    } else if (MediaManager.PLAY_ACTION === action) {
      this.play()
    } else if (MediaManager.PAUSE_ACTION === action) {
      this.pause()
    } else if (MediaManager.PLAY_PAUSE_ACTION === action) {
      this.playPause()
    } else if (MediaManager.NEXT_TRACK_ACTION === action) {
      this.next()
    }
  }
}
