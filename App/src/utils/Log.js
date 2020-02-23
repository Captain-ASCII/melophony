
export default class Log {

  static d(msg) {
    console.debug(msg)
  }

  static i(msg) {
    console.log(msg)
  }

  static w(msg) {
    console.warn(msg)
  }

  static e(msg, error) {
    console.error(msg, error)
  }
}