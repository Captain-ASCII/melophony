
import JWT from 'jwt-client'

import { store } from '@store'

import Notification from '@models/Notification'

import { addNotification } from '@actions/Notification'

class ApiRequest {

  method: string
  baseUrl: string
  path: string
  parameters: RequestInit
  headers: Headers

  constructor(baseUrl: string, method: string, path: string) {
    this.method = method
    this.baseUrl = baseUrl
    this.path = path
    this.headers = new Headers()
    this.parameters = { method: method, headers: this.headers }
  }

  withHeader(header: string, value: string): ApiRequest {
    this.headers.append(header, value)
    return this
  }

  withBody(body: object): ApiRequest {
    this.headers.append('Content-Type', 'application/json')
    this.parameters.body = JSON.stringify(body)

    return this
  }

  getBaseUrl(): string {
    return this.baseUrl
  }

  getPath(): string {
    return this.path
  }

  getParams(): RequestInit {
    return this.parameters
  }
}

export default class ApiManager {

  serverUrl: string
  isWithAuthentication: boolean
  request: ApiRequest

  constructor(serverUrl: string, withAuthentication = true) {
    this.serverUrl = serverUrl
    this.isWithAuthentication = withAuthentication
    this.request = new ApiRequest('', 'GET', '')
  }

  clone(): ApiManager {
    return new ApiManager(this.serverUrl, this.isWithAuthentication)
  }

  withServerAddress(address: string): ApiManager {
    const clone = this.clone()
    clone.serverUrl = address
    return clone
  }

  createRequest(): ApiRequest {
    this.request = new ApiRequest(this.serverUrl, 'GET', '')
    return this.request
  }

  get(path: string, onResult: (code: number, data: any) => void | null = null, withNotification = false): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'GET', path)
    return this.sendRequest(onResult, withNotification)
  }

  post(path: string, body: object, onResult: (code: number, data: any) => void | null = null, withNotification = true): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'POST', path).withBody(body)
    return this.sendRequest(onResult, withNotification)
  }

  put(path: string, body: object, onResult: (code: number, data: any) => void | null = null, withNotification = true): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'PUT', path).withBody(body)
    return this.sendRequest(onResult, withNotification)
  }

  delete(path: string, onResult: (code: number, data: any) => void | null = null, withNotification = true): Promise<[number, any]> {
    this.request = new ApiRequest(this.serverUrl, 'DELETE', path)
    return this.sendRequest(onResult, withNotification)
  }

  sendRequest(onResult: (code: number, data: any) => void | null, withNotification: boolean): Promise<[number, any]> {
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
      if (withNotification) {
        store.dispatch(addNotification(new Notification(body.message)))
      }
      if (onResult) {
        onResult(data[0], body)
      }
    })
    .catch((error: Error) => {
      console.error(error)
      throw new Error('Failure during network request')
    })

    return json
  }
}