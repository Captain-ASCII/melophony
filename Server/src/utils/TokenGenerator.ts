import JWT from 'jsonwebtoken'

export default class TokenGenerator {

  private secret: JWT.Secret
  private options: any

  constructor(secret: JWT.Secret, options: any) {
    this.secret = secret
    this.options = options
  }

  sign(payload: string | object | Buffer, signOptions: JWT.SignOptions = {}): string {
    const jwtSignOptions = Object.assign({}, signOptions, this.options)
    return JWT.sign(payload, this.secret, jwtSignOptions)
  }

  // refreshOptions.verify = options you would use with verify function
  // refreshOptions.jwtid = contains the id for the new token
  refresh(token: string): string {
    const payload: any = JWT.verify(token, this.secret)
    if (typeof payload === 'object') {
      delete payload.iat
      delete payload.exp
      delete payload.nbf
      delete payload.jti
    }
    // const jwtSignOptions = Object.assign({ }, this.options, { jwtid: refreshOptions.jwtid })
    return JWT.sign(payload, this.secret, this.options)
  }
}