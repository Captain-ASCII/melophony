
import JWT from 'jwt-client'

export default class TokenManager {

  private tokenExpirationCallback: () => void
  private timeoutId: number

  public constructor(tokenExpirationCallback: () => void) {
    this.tokenExpirationCallback = tokenExpirationCallback
    this.timeoutId = null
  }

  public keepToken(body: any): void {
    if (body.token && JWT.validate(body.token)) {
      JWT.keep(body.token)
      const decoded = JWT.read(body.token)
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }
      this.timeoutId = window.setTimeout(() => {
        if (this.tokenExpirationCallback) {
          this.tokenExpirationCallback()
        }
      }, (decoded.claim.exp * 1000) - new Date().getTime());
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