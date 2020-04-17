
import Bcrypt from 'bcrypt'

export default class AuthUtils {

  private static SALT_ROUNDS = 10

  static getHash(password: string): string {
    const salt = Bcrypt.genSaltSync(AuthUtils.SALT_ROUNDS)
    return Bcrypt.hashSync(password, salt)
  }
}