
import Log from '@utils/Log'
import TokenManager from '@utils/TokenManager'

class ApiTimeoutError extends Error {}

function timeout<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise<T>(function(resolve, reject) {
    setTimeout(function() {
      reject(new ApiTimeoutError(`Available time for API request (${ms/1000}s) has been exceeded`))
    }, ms)
    promise.then(resolve, reject)
  })
}

export class ApiRequest {

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

export class RequestCustomizer {

  private resultCallback: ((code: number, data: any | null) => void) | undefined
  private timeout: number

  public constructor(resultCallback: ((code: number, data: any | null) => void) | undefined = undefined, timeout = 2000) {
    this.resultCallback = resultCallback
    this.timeout = timeout
  }

  public onResult(code: number, data: any): void {
    if (this.resultCallback) {
      this.resultCallback(code, data)
    }
  }

  public getTimeout(): number {
    return this.timeout
  }

  public static NULL = new RequestCustomizer()
  public static DEFAULT: RequestCustomizer = new RequestCustomizer()

  public static setDefault(customizer: RequestCustomizer): void {
    RequestCustomizer.DEFAULT = customizer
  }
}

export default class ApiManager {

  private serverUrl: string
  private request: ApiRequest
  private tokenManager: TokenManager

  public constructor(serverUrl: string, tokenManager: TokenManager) {
    this.serverUrl = serverUrl
    this.request = new ApiRequest('', 'GET', '')
    this.tokenManager = tokenManager
  }

  public clone(): ApiManager {
    return new ApiManager(this.serverUrl, this.tokenManager)
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

  public get(path: string, customizer: RequestCustomizer = RequestCustomizer.NULL): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'GET', path)
    return this.send(customizer)
  }

  public post(path: string, body: object, customizer: RequestCustomizer = RequestCustomizer.DEFAULT): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'POST', path).withBody(body)
    return this.send(customizer)
  }

  public put(path: string, body: object, customizer: RequestCustomizer = RequestCustomizer.DEFAULT): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'PUT', path).withBody(body)
    return this.send(customizer)
  }

  public delete(path: string, customizer: RequestCustomizer = RequestCustomizer.DEFAULT): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'DELETE', path)
    return this.send(customizer)
  }

  private send(customizer: RequestCustomizer): Promise<[number, any]> {
    this.tokenManager.addToken(this.request)
    console.warn(`${this.request.getBaseUrl()}${this.request.getPath()}`, this.request.getParams())

    const json = timeout(
      customizer.getTimeout(),
      fetch(`${this.request.getBaseUrl()}${this.request.getPath()}`, this.request.getParams())
        .then(async (response: Response): Promise<[number, any]> => [ response.status, await response.json() ])
    )

    json.then((data: [number, any]) => {
      this.tokenManager.keepToken(data[1])
      customizer.onResult(data[0], data[1])
    }).catch((error: Error) => {
      if (error instanceof ApiTimeoutError) {
        Log.w('Unable to get information from the server')
        customizer.onResult(408, null)
      } else {
        Log.e('Error during API request', error)
        throw new Error('Failure during network request')
      }
    })

    return json.then(data => [ data[0], data[1].data ])
  }
}