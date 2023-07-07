
import JWT, { JWTObject } from 'jwt-client'

export default class TokenManager {

  private tokenExpirationCallback: () => void
  private timeoutId: number

  public constructor(tokenExpirationCallback: () => void) {
    this.tokenExpirationCallback = tokenExpirationCallback
    this.timeoutId = null
  }

  public keepToken(token: string): void {
    if (token) {
      const tokenObject = JWT.read(token)
      if (tokenObject && JWT.validate(tokenObject)) {
        JWT.keep(tokenObject)
        if (this.timeoutId) {
          clearTimeout(this.timeoutId)
        }
        this.timeoutId = window.setTimeout(() => {
          if (this.tokenExpirationCallback) {
            this.tokenExpirationCallback()
          }
        }, (tokenObject.claim.exp * 1000) - new Date().getTime());
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