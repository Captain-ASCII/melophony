
import Environment from '@projectConfiguration'

enum LOG_LEVELS {
  ERROR = 0,
  WARNING = 1,
  INFO = 2,
  DEBUG = 3,
}

export default class Log {

  static LOG_LEVEL = Environment.DEBUG ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARNING

  static d(msg: any, object: any = ''): void {
    if (Log.LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      console.debug(msg, object)
    }
  }

  static i(msg: any, object: any = ''): void {
    if (Log.LOG_LEVEL >= LOG_LEVELS.INFO) {
      console.log(msg, object)
    }
  }

  static w(msg: any, object: any = ''): void {
    if (Log.LOG_LEVEL >= LOG_LEVELS.WARNING) {
      console.warn(msg, object)
    }
  }

  static e(msg: string, error: Error): void {
    if (Log.LOG_LEVEL >= LOG_LEVELS.ERROR) {
      console.error(msg, error)
    }
  }
}