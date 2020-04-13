
import JWT from 'jwt-client'

import { store } from '@store'

import Track from '@models/Track'

export default class MediaManager {

  static EXTRACT_DURATION = 2000

  private audio: HTMLAudioElement

  private isPlayingExtract: boolean
  private extractTimeout: any

  constructor(audio: HTMLAudioElement = null, isPlayingExtract = false) {
    this.audio = audio
    this.isPlayingExtract = isPlayingExtract
    this.extractTimeout = null

    const onKeyDown = (event: any): void => {
      const tag = event.target.tagName.toLowerCase()
      if (event.keyCode == 32 && tag != 'input' && tag != 'textarea') {
        this.playPause()
      }
    }
    window.addEventListener('keydown', e => onKeyDown(e))
  }

  clone(): MediaManager {
    return new MediaManager(this.audio, this.isPlayingExtract)
  }

  withAudio(audio: HTMLAudioElement): MediaManager {
    const clone = this.clone()
    clone.audio = audio
    return clone
  }

  setElementHTML(id: string, value: string): void {
    if (document !== undefined) {
      const element = document.getElementById(id)
      if (element) {
        element.innerHTML = value
      }
    }
  }

  setElementClass(id: string, value: string): void {
    if (document !== undefined) {
      const element = document.getElementById(id)
      if (element) {
        element.className = value
      }
    }
  }

  setTrack(track: Track | null): void {
    if (track !== null) {
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
      this.play()
    }
  }

  play(): void {
    if (this.audio.src !== '') {
      this.audio.onended = (): void => this.next()
      this.audio.play()
      this.setElementClass('playButton', 'fa fa-pause fa-2x')
    }
  }

  pause(): void {
    this.audio.pause()
    this.setElementClass('playButton', 'fa fa-play fa-2x')
  }

  previous(): void {
    store.getState().app.playlist = store.getState().app.playlist.previous()
    this.setTrack(store.getState().app.playlist.getCurrent())
    this.play()
  }

  next(): void {
    store.getState().app.playlist = store.getState().app.playlist.next()
    this.setTrack(store.getState().app.playlist.getCurrent())
    this.play()
  }

  playPause(): void {
    if (this.audio.paused) {
      this.play()
    } else {
      this.pause()
    }
  }

  playExtract(track: Track, time: number): void {
    this.audio.onended = (): boolean => false

    if (!this.isPlayingExtract) {
      this.audio.src = `${store.getState().configuration.getServerAddress()}/file/${track.getFile().getVideoId()}.m4a`
      this.isPlayingExtract = true
    }
    this.audio.currentTime = time
    this.audio.play()
    if (this.extractTimeout) {
      clearTimeout(this.extractTimeout)
    }
    this.extractTimeout  = setTimeout(() => this.audio.pause(), MediaManager.EXTRACT_DURATION)
  }
}