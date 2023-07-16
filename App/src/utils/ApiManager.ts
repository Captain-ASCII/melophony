
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

type QueryParameters = {
  id: string;
}

export class ApiClient {

  protected serverUrl: string
  protected baseNode: string
  protected resultCallback: (data: [number, any, Headers]) => [number, any, Headers]

  public constructor(serverUrl: string, baseNode = "", onResult: (data: [number, any, Headers]) => [number, any, Headers] = () => [-1, {}, null]) {
    this.serverUrl = serverUrl
    this.baseNode = baseNode
    this.resultCallback = onResult
  }

  public get(path: string, queryParams: QueryParams = {}, headers: Headers = new Headers()): Promise<[number, any, Headers]> {
    return this.send(this.serverUrl + this.baseNode, 'GET', path, null, queryParams, headers)
  }

  public post(path: string, json: object, queryParams: QueryParams = {}, headers: Headers = new Headers()): Promise<[number, any, Headers]> {
    return this.send(this.serverUrl + this.baseNode, 'POST', path, JSON.stringify(json), queryParams, headers)
  }

  public postFile(path: string, json: object, file: File, queryParams: QueryParams = {}, headers: Headers = new Headers()): Promise<[number, any, Headers]> {
    const formData = new FormData()
    formData.append('data', file)
    formData.append('json', JSON.stringify(json))
    headers.set('Content-Type', 'multipart/form-data')
    return this.send(this.serverUrl + this.baseNode, 'POST', path, formData, queryParams, headers)
  }

  public patch(path: string, json: object, queryParams: QueryParams = {}, headers: Headers = new Headers()): Promise<[number, any, Headers]> {
    return this.send(this.serverUrl + this.baseNode, 'PATCH', path, JSON.stringify(json), queryParams, headers)
  }

  public delete(path: string, queryParams: QueryParams = {}, headers: Headers = new Headers()): Promise<[number, any, Headers]> {
    return this.send(this.serverUrl + this.baseNode, 'DELETE', path, null, queryParams, headers)
  }

  private getFetchParams(method: string, body: string | FormData, headers: Headers): RequestInit {
    const result = {
      method: method,
      headers: headers
    }

    if (body != null) {
      return { ...result, body }
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

  protected send(baseUrl: string, method: string, path: string, body: string | FormData, queryParams: QueryParams, headers: Headers): Promise<[number, any, Headers]> {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    } else if (headers.get('Content-Type') === 'multipart/form-data') {
      // Do not set Content-Type explictly, this causes the browser not adding the boundaries to the FormData.
      headers.delete('Content-Type')
    }
    const fetchParams = this.getFetchParams(method, body, headers)
    const queryParamString = this.getQueryParamString(queryParams)

    const json = timeout(
      NETWORK_TIMEOUT,
      fetch(`${baseUrl}${path}${queryParamString}`, fetchParams)
        .then(async (response: Response): Promise<[number, any, Headers]> => {
          let json = {}
          if (response.status != 204) {
            json = await response.json()
          }
          return [ response.status, json, response.headers ]
        })
    )

    return json.catch((error: Error) => {
      if (error instanceof ApiTimeoutError) {
        Log.w('Unable to get information from the server')
        return Promise.reject(this.resultCallback([408, null, null]))
      } else {
        Log.e('Error during API request', error)
        return Promise.reject(this.resultCallback([500, null, null]))
      }
    })
  }
}

export default class MelophonyApiClient extends ApiClient {

  private tokenManager: TokenManager

  public constructor(serverUrl: string, onResult: (data: [number, any, Headers]) => [number, any, Headers], tokenManager: TokenManager) {
    super(serverUrl, "/api", onResult)
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

  public hasValidToken(): boolean {
    return this.tokenManager.hasValidToken()
  }

  protected send(baseUrl: string, method: string, path: string, body: string | FormData, queryParams: QueryParams, headers: Headers): Promise<[number, any, Headers]> {
    if (this.tokenManager != null) {
      if (this.tokenManager.getToken() != null) {
        headers.append('Authorization', this.tokenManager.getToken())
      }
    }

    const response = super.send(baseUrl, method, path, body, queryParams, headers)

    return response.then(([status, body, headers]: [number, any, Headers]) => {
      if (this.tokenManager != null) {
        this.tokenManager.keepToken(headers.get('Token'))
      }
      const message = headers.get('Message')
      const result: [number, any, Headers] = [ status, body, headers ]

      if (this.resultCallback && this.hasValidToken() && message != null) {
        this.resultCallback(result)
      }

      return result
    })
  }
}

export { QueryParameters }