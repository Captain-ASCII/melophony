
enum AppEvents {
  DOWNLOAD_PROGRESS = 'downloadProgress',
  DOWNLOAD_END = 'downloadEnd',
}

class Listener {

  private event: string
  private callback: Function

  constructor(event: string, callback: Function) {
    this.event = event
    this.callback = callback
  }

  notify(parameters: any): void {
    this.callback.apply(null, parameters)
  }

  getEvent(): string {
    return this.event
  }
}

class ListenerConnector {

  private listeners: Array<Listener>

  constructor() {
    this.listeners = []
  }

  on(event: string, listenerCallback: Function): void {
    this.listeners.push(new Listener(event, listenerCallback))
  }

  notify(event: string, parameters: any): void {
    for (const listener of this.listeners) {
      if (listener.getEvent() === event) {
        listener.notify(parameters)
      }
    }
  }
}

const GLOBAL_LISTENER = new ListenerConnector()

function getListenerConnector(): ListenerConnector {
  return GLOBAL_LISTENER
}

export { AppEvents, getListenerConnector }