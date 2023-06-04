
export default class File {

  private id: string
  private fileId: string
  private state: string

  public constructor(id: string, fileId: string, state: string) {
    this.id = id
    this.fileId = fileId
    this.state = state
  }

  public static fromObject(o: any): File | null {
    if (o) {
      return new File(o.id, o.fileId, o.state)
    }
    return null
  }

  public withId(id: string): File {
    this.id = id
    return this
  }

  public withFileId(fileId: string): File {
    this.fileId = fileId
    return this
  }

  public withState(state: string): File {
    this.state = state
    return this
  }

  public getId(): string {
    return this.id
  }

  public getFileId(): string {
    return this.fileId
  }

  public getState(): string {
    return this.state
  }
}