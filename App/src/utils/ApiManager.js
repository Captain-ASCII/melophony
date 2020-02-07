
export default class ApiManager {

  request = {};

  constructor(serverUrl) {
    this.serverUrl = serverUrl
    this.request = {}
  }

  createRequest() {
    this.request = new ApiRequest(this.serverUrl, 'GET', '')
    return this.request
  }

  get(path, params) {
    this.request = new ApiRequest(this.serverUrl, 'GET', path)
    return this.sendRequest(params)
  }

  post(path, body, params) {
    this.request = new ApiRequest(this.serverUrl, 'POST', path).withBody(body)
    return this.sendRequest(params)
  }

  put(path, body, params) {
    this.request = new ApiRequest(this.serverUrl, 'PUT', path).withBody(body)
    return this.sendRequest(params)
  }

  delete(path, params) {
    this.request = new ApiRequest(this.serverUrl, 'DELETE', path)
    return this.sendRequest(params)
  }

  sendRequest(params) {
    console.warn(`${this.request.getBaseUrl()}/${this.request.getPath()}`, this.request.getParams())

    fetch(`${this.request.getBaseUrl()}/${this.request.getPath()}`, this.request.getParams())
    .then(response => response.json())
    .then(data => {
      if (params.onResult) {
        params.onResult(data)
      }
    })
    .catch(error => {
      throw new Error('Failure during network request', error)
    })
  }
}

class ApiRequest {

  method = '';
  baseUrl = '';
  path = '';
  parameters = null;
  body = '';

  constructor(baseUrl, method, path) {
    this.method = method
    this.baseUrl = baseUrl
    this.path = path
    this.parameters = { method: method }
    this.body = ''
  }

  withParameter(key, value) {
    this.parameters[key] = value

    return this
  }

  withBody(body) {
    if (!this.parameters['headers']) {
      this.parameters['headers'] = {}
    }
    this.parameters['headers']['Content-Type'] = 'application/json'

    this.body = JSON.stringify(body)
    this.parameters['body'] = this.body

    return this
  }

  getBaseUrl() {
    return this.baseUrl
  }

  getPath() {
    return this.path
  }

  getParams() {
    return this.parameters
  }
}