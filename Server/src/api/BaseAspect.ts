import Express, { Router, Response } from 'express'

import ApiResult from '@api/ApiResult'

export default class BaseAspect {

  public router: Router = Express.Router()

  sendResponse(response: Response, result: ApiResult): void {
    if (response.token) {
      result.setToken(response.token)
    }
    response.status(result.getStatus()).send(result)
  }

  getRouter(): Router {
    return this.router
  }
}