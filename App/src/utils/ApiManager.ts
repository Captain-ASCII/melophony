
import JWT from 'jwt-client'

class ApiRequest {

  private method: string
  private baseUrl: string
  private path: string
  private parameters: RequestInit
  private headers: Headers

  public constructor(baseUrl: string, method: string, path: string) {
    this.method = method
    this.baseUrl = baseUrl
    this.path = path
    this.headers = new Headers()
    this.parameters = { method: method, headers: this.headers }
  }

  public withHeader(header: string, value: string): ApiRequest {
    this.headers.append(header, value)
    return this
  }

  public withBody(body: object): ApiRequest {
    this.headers.append('Content-Type', 'application/json')
    this.parameters.body = JSON.stringify(body)

    return this
  }

  public getBaseUrl(): string {
    return this.baseUrl
  }

  public getPath(): string {
    return this.path
  }

  public getParams(): RequestInit {
    return this.parameters
  }
}

export default class ApiManager {

  private serverUrl: string
  private isWithAuthentication: boolean
  private defaultCallback: ((code: number, data: any) => void)
  private request: ApiRequest

  public constructor(serverUrl: string, withAuthentication = true, defaultCallback: ((code: number, data: any) => void) = () => {}) {
    this.serverUrl = serverUrl
    this.isWithAuthentication = withAuthentication
    this.defaultCallback = defaultCallback
    this.request = new ApiRequest('', 'GET', '')
  }

  public clone(): ApiManager {
    return new ApiManager(this.serverUrl, this.isWithAuthentication)
  }

  public withServerAddress(address: string): ApiManager {
    const clone = this.clone()
    clone.serverUrl = address
    return clone
  }

  public createRequest(): ApiRequest {
    this.request = new ApiRequest(this.serverUrl, 'GET', '')
    return this.request
  }

  public get(path: string, onResult: ((code: number, data: any) => void) | false | undefined = false): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'GET', path)
    return this.sendRequest(onResult)
  }

  public post(path: string, body: object, onResult: ((code: number, data: any) => void) | false | undefined = undefined): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'POST', path).withBody(body)
    return this.sendRequest(onResult)
  }

  public put(path: string, body: object, onResult: ((code: number, data: any) => void) | false | undefined = undefined): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'PUT', path).withBody(body)
    return this.sendRequest(onResult)
  }

  public delete(path: string, onResult: ((code: number, data: any) => void) | false | undefined = undefined): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'DELETE', path)
    return this.sendRequest(onResult)
  }

  private sendRequest(onResult: ((code: number, data: any) => void) | false | undefined): Promise<[number, any]> {
    if (this.isWithAuthentication) {
      this.request.withHeader('Authorization', JWT.get())
    }
    console.warn(`${this.request.getBaseUrl()}${this.request.getPath()}`, this.request.getParams())

    const json = fetch(`${this.request.getBaseUrl()}${this.request.getPath()}`, this.request.getParams())
      .then(async (response: Response): Promise<[number, any]> => [response.status, await response.json()])

    json.then((data: [number, any]) => {
      const body = data[1]
      if (this.isWithAuthentication) {
        if (body.token && JWT.validate(body.token)) {
          JWT.keep(body.token)
        }
      }
      if (onResult) {
        onResult(data[0], body)
      } else if (onResult !== false) {
        this.defaultCallback(data[0], body)
      }
    })
      .catch((error: Error) => {
        console.error(error)
        throw new Error('Failure during network request')
      })

    return json
  }
}