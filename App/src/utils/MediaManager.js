
export default class MediaManager {
  
  static EXTRACT_DURATION = 2000;
  
  constructor() {
    this.currentIndex = 0
    
    this.isPlayingExtract = false
    this.extractTimeout = null
    
    this.setPlayer()
    
    // window.addEventListener('keydown', e => this.onKeyDown(e))
  }
  
  onKeyDown(event) {
    let tag = event.target.tagName.toLowerCase()
    if (event.keyCode == 32 && tag != 'input' && tag != 'textarea') {
      this.playPause()
    }
  }
  
  setPlayer() {
    if (!this.player) {
      this.player = document.getElementById('player')
    }
  }
  
  getCurrentTrack() {
    return dataStorage.getAsArray('sortedTracks')[this.currentIndex] || { id: '' }
  }
  
  startPlay(id, index) {
    this.currentIndex = index
    
    let track = dataStorage.get('tracks')[id]
    let artist = dataStorage.get('artists')[track.artist] || { name: 'Unknown' }
    
    this.player.addEventListener('error', event => {
      if (event.target.error && event.target.error.code == 4) {
        this.player.src = `https://melophony.ddns.net/files/${track.videoId}.m4a`
        this.player.load()
      }
    })
    
    this.player.src = `${configurationManager.get('serverAddress')}/files/${track.videoId}.m4a`
    this.player.currentTime = track.startTime
    
    this.player.ontimeupdate = (event) => {
      if (this.player.currentTime > track.endTime) {
        this.next()
      }
    }
    document.getElementById('currentTrackInfo').innerHTML = `${artist.name} - ${track.title}`
    // new InputRange("tracker", document.getElementById("tracker"), track).asReader(player);
    actionManager.do('setTrack', '', track)
    
    this.play()
  }
  
  previous() {
    let tracksArray = dataStorage.getAsArray('sortedTracks')
    this.currentIndex = (this.currentIndex - 1) % tracksArray.length
    this.startPlay(`${tracksArray[this.currentIndex].id}`, this.currentIndex)
  }
  
  play() {
    if (this.player.src == '') {
      this.next()
    } else {
      this.player.onended = _ => this.next()
      this.player.play()
      document.getElementById('playButton').className = 'fa fa-pause fa-2x'
    }
  }
  
  pause() {
    this.player.pause()
    document.getElementById('playButton').className = 'fa fa-play fa-2x'
  }
  
  playPause() {
    if (this.player.paused) {
      this.play()
    } else {
      this.pause()
    }
  }
  
  next() {
    let tracksArray = dataStorage.getAsArray('sortedTracks')
    this.currentIndex = configurationManager.get('shuffleMode') ? Math.floor(Math.random() * tracksArray.length) : (this.currentIndex + 1) % tracksArray.length
    this.startPlay(`${tracksArray[this.currentIndex].id}`, this.currentIndex)
  }
  
  playExtract(track, time) {
    this.player.onended = _ => false
    
    if (!this.isPlayingExtract) {
      this.player.src = `${configurationManager.get('serverAddress')}/files/${track.videoId}.m4a`
      this.isPlayingExtract = true
    }
    this.player.currentTime = time
    this.player.play()
    if (this.extractTimeout) {
      clearTimeout(this.extractTimeout)
    }
    this.extractTimeout = setTimeout(_ => this.player.pause(), MediaManager.EXTRACT_DURATION)
  }
}