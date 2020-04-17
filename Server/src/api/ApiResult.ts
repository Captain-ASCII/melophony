
export default class ApiResult {

  private status: number
  private message: string
  private token?: string
  private data?: any

  constructor(status: number, message: string, data: any = undefined, token = '') {
    this.status = status
    this.message = message
    this.data = data
    if (token !== '') {
      this.token = token
    }
  }

  setStatus(status: number): void {
    this.status = status
  }

  setMessage(message: string): void {
    this.message = message
  }

  setToken(token: string): void {
    this.token = token
  }

  setData(data: any): void {
    this.data = data
  }

  getStatus(): number {
    return this.status
  }

  getMessage(): string {
    return this.message
  }

  getToken(): string | undefined {
    return this.token
  }

  getData(): any {
    return this.data
  }

  toString(): string {
    return `{
      status: ${this.status},
      message: ${this.message},
      token: ${this.token},
      data: ${this.data.toJSON()},
    }`
  }

}