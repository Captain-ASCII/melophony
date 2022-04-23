
export default class MediaUtils {
  static isMobileScreen(): boolean {
    return window.innerWidth <= 768
  }

  static isThinMobileScreen(): boolean {
    return window.innerWidth <= 450
  }
}