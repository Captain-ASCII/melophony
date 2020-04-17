
import FileSystem from 'fs'

import BaseAspect from '@api/BaseAspect'

export default class LogAspect extends BaseAspect {

  static LOGS_FILE = 'logs/logs.txt'

  constructor() {
    super()

    this.router.use('*', (request, response, next) => {
      const now = new Date()
      const log = `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}: Received request ${request.method} - [${request.originalUrl}]`
      console.log(log)
      FileSystem.writeFile(LogAspect.LOGS_FILE, log, () => false)
      next()
    })
  }
}