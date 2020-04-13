
export default class Log {

  static d(msg: string): void {
    console.debug(msg)
  }

  static i(msg: string): void {
    console.log(msg)
  }

  static w(msg: string): void {
    console.warn(msg)
  }

  static e(msg: string, error: Error): void {
    console.error(msg, error)
  }
}