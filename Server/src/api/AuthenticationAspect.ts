
import JWT from 'jsonwebtoken'
import Bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { getConnection } from 'typeorm'

import Environment from '@projectConfiguration'

import TokenGenerator from '@utils/TokenGenerator'

import User from '@models/User'

import BaseAspect from '@api/BaseAspect'
import ApiResult from '@api/ApiResult'

export default class AuthenticationAspect extends BaseAspect {

  private static TOKEN_LIFETIME = 1800

  private tokenGenerator: TokenGenerator

  constructor() {
    super()

    this.tokenGenerator = new TokenGenerator(Environment.SECRET, { expiresIn: AuthenticationAspect.TOKEN_LIFETIME })

    this.router.post('/login', async (request, response) => this.sendResponse(response, await this.authenticate(request.body.email, request.body.password)))

    this.router.use(this.protectRoutesWith(this.checkToken.bind(this)))
    this.router.use(this.protectRoutesWith(this.refreshToken.bind(this)))
  }

  protectRoutesWith(middlewareFunction: (request: Request, response: Response, next: Function) => void) {
    return function(request: Request, response: Response, next: Function): void {
      if (request.path === '/register' && request.method === 'POST') {
        next()
      } else {
        middlewareFunction(request, response, next)
      }
    }
  }

  async authenticate(email: string, password: string): Promise<ApiResult> {
    if (email && password) {
      const user = await getConnection().getRepository(User).findOne({ email })
      if (user && Bcrypt.compareSync(password, user.password)) {
        const token = this.tokenGenerator.sign({ userId: user.id })
        return new ApiResult(200, 'Authentication successful', {}, token)
      }
      return new ApiResult(400, 'Invalid credentials')
    }
    return new ApiResult(400, 'Missing information (needs email & password)')
  }

  checkToken(request: Request, response: Response, next: Function): void {
    let token = request.headers['authorization'] || request.query.jwt
    if (token !== undefined && typeof token === 'string') {
     if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length)
      }

      JWT.verify(token, Environment.SECRET, (err: any, decoded: any) => {
        if (err) {
          this.sendResponse(response, new ApiResult(400, 'Token is not valid'))
        } else {
          if (typeof token === 'string') {
            request.token = token
          }
          if (decoded) {
            request.decoded = decoded
          }
          next()
        }
      })
    } else {
      this.sendResponse(response, new ApiResult(400, 'Auth token is not provided'))
    }
  }

  refreshToken(request: Request, response: Response, next: Function): void {
    if (request.token && request.decoded && request.decoded.iat) {
      const date = new Date()
      const UTCDate =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds()) / 1000
      const timeSpent = UTCDate - request.decoded.iat
      if ((((2 * AuthenticationAspect.TOKEN_LIFETIME) / 3) < timeSpent) && (timeSpent < AuthenticationAspect.TOKEN_LIFETIME)) {
        response.token = this.tokenGenerator.refresh(request.token)
      }
    }
    next()
  }
}
