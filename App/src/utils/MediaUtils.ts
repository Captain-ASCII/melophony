
export default class MediaUtils {
  static isMobileScreen(): boolean {
    return window.innerWidth <= 768
  }


  static isAndroidWebApp(): boolean {
    try {
      //@ts-ignore
      return Android.isAndroidWebApp()
    } catch (error) {
      return false
    }
  }

  static isThinMobileScreen(): boolean {
    return window.innerWidth <= 450
  }
}