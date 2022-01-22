
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

const NETWORK_TIMEOUT = 15000

interface QueryParams {
  [key: string]: string;
}

export class ApiClient {

  protected serverUrl: string
  protected resultCallback: (data: [number, any]) => [number, any]

  public constructor(serverUrl: string, onResult: (data: [number, any]) => [number, any]) {
    this.serverUrl = serverUrl
    this.resultCallback = onResult
  }

  public get(path: string, queryParams: QueryParams = {}, headers: Headers = new Headers()): Promise<[number, any]> {
    return this.send(this.serverUrl, 'GET', path, null, queryParams, headers)
  }

  public post(path: string, body: object, queryParams: QueryParams = {}, headers: Headers = new Headers()): Promise<[number, any]> {
    return this.send(this.serverUrl, 'POST', path, body, queryParams, headers)
  }

  public put(path: string, body: object, queryParams: QueryParams = {}, headers: Headers = new Headers()): Promise<[number, any]> {
    return this.send(this.serverUrl, 'PUT', path, body, queryParams, headers)
  }

  public delete(path: string, queryParams: QueryParams = {}, headers: Headers = new Headers()): Promise<[number, any]> {
    return this.send(this.serverUrl, 'DELETE', path, null, queryParams, headers)
  }

  private getFetchParams(method: string, body: object, headers: Headers): RequestInit {
    const result = {
      method: method,
      headers: headers
    }

    if (body != null) {
      return { ...result, body: JSON.stringify(body) }
    }

    return result
  }

  private getQueryParamString(queryParams: QueryParams): string {
    const list: Array<String> = []

    for (const param in queryParams) {
      list.push(param + '=' + queryParams[param])
    }

    return '?' + list.join('&')
  }

  protected send(baseUrl: string, method: string, path: string, body: object, queryParams: QueryParams, headers: Headers): Promise<[number, any]> {
    const fetchParams = this.getFetchParams(method, body, headers)
    const queryParamString = this.getQueryParamString(queryParams)

    console.warn(`${baseUrl}${path}${queryParamString}`, fetchParams)

    const json = timeout(
      NETWORK_TIMEOUT,
      fetch(`${baseUrl}${path}${queryParamString}`, fetchParams)
        .then(async (response: Response): Promise<[number, any]> => [ response.status, await response.json() ])
    )

    if (method !== 'GET') {
      json.then(this.resultCallback)
    }

    return json.catch((error: Error) => {
      if (error instanceof ApiTimeoutError) {
        Log.w('Unable to get information from the server')
        return Promise.reject(this.resultCallback([408, null]))
      } else {
        Log.e('Error during API request', error)
        return Promise.reject(this.resultCallback([500, null]))
      }
    })
  }
}

export default class MelophonyApiClient extends ApiClient {

  private tokenManager: TokenManager

  public constructor(serverUrl: string, onResult: (data: [number, any]) => [number, any], tokenManager: TokenManager) {
    super(serverUrl, onResult)
    this.tokenManager = tokenManager
  }

  public clone(): MelophonyApiClient {
    return new MelophonyApiClient(this.serverUrl, this.resultCallback, this.tokenManager)
  }

  public withServerAddress(address: string): MelophonyApiClient {
    const clone = this.clone()
    clone.serverUrl = address
    return clone
  }

  protected send(baseUrl: string, method: string, path: string, body: object, queryParams: QueryParams, headers: Headers): Promise<[number, any]> {
    if (this.tokenManager != null) {
      if (this.tokenManager.getToken() != null) {
        headers.append('Authorization', this.tokenManager.getToken())
      }
    }

    const response = super.send(baseUrl, method, path, body, queryParams, headers)

    return response.then((data: [number, any]) => {
      if (this.tokenManager != null) {
        this.tokenManager.keepToken(data[1])
      }
      return [ data[0], data[1].data ]
    })
  }
}