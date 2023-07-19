
import JWT, { JWTObject } from 'jwt-client'

export default class TokenManager {

  private tokenExpirationCallback: () => void

  public constructor(tokenExpirationCallback: () => void) {
    this.tokenExpirationCallback = tokenExpirationCallback
  }

  public keepToken(token: string): void {
    if (token) {
      const tokenObject = JWT.read(token)
      if (tokenObject && JWT.validate(tokenObject)) {
        JWT.keep(tokenObject)
      }
    }
  }

  public getToken(): string {
    return JWT.get()
  }

  public hasValidToken(): boolean {
    const token = this.getToken()
    if (token != null) {
      return JWT.validate(JWT.read(this.getToken()))
    }
    return false
  }
}