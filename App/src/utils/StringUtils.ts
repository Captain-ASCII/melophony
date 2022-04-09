
export default class Utils {
  static generateId(): string {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  static isNumber(value: string): boolean {
    return !isNaN(parseInt(value))
  }

  static notNullNorEmpty(value: string): boolean {
    return value != null && value !== ''
  }
}