
export default class OverlayMessage {

  private message: string
  private onConfirm: (confirmation: boolean) => void

  constructor(message: string, onConfirm: (confirmation: boolean) => void) {
    this.message = message
    this.onConfirm = onConfirm
  }

  getMessage(): string {
    return this.message
  }

  getConfirmCallback(): (confirmation: boolean) => void {
    return this.onConfirm
  }
}