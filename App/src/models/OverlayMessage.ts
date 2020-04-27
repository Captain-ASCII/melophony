
export default class OverlayMessage {

  private message: string
  private onConfirm: (confirmation: boolean) => void

  public constructor(message: string, onConfirm: (confirmation: boolean) => void) {
    this.message = message
    this.onConfirm = onConfirm
  }

  public getMessage(): string {
    return this.message
  }

  public getConfirmCallback(): (confirmation: boolean) => void {
    return this.onConfirm
  }
}