
export default class MediaUtils {
  static isMobileScreen(): boolean {
    return window.innerWidth <= 768
  }

  static raiseFooterOnMobile(): void {
    if (MediaUtils.isMobileScreen()) {
      document.getElementById("footer").style.height = '80px'
      document.getElementById("currentTrackInfo").style.height = '80px'
      document.getElementById("bubble").style.bottom = `54px`
      document.getElementById("mainContainer").style.height = `calc(100% - 160px)`
    }
  }

  static isAndroidWebApp(): boolean {
    try {
      //@ts-ignore
      return Android.isAndroidWebApp()
    } catch (error) {
      return false
    }
  }

  static notifyAndroidPlayerState(isPlaying: boolean, title: string, artistName: string): boolean {
    try {
      //@ts-ignore
      return Android.onPlayerStateChange(isPlaying, title, artistName)
    } catch (error) {
      return false
    }
  }

  static isThinMobileScreen(): boolean {
    return window.innerWidth <= 450
  }

  static isDebugMode(): boolean {
    return false
  }
}