
export default class File {

  private id: string
  private videoId: string
  private state: string

  public constructor(id: string, videoId: string, state: string) {
    this.id = id
    this.videoId = videoId
    this.state = state
  }

  public withId(id: string): File {
    this.id = id
    return this
  }

  public withVideoId(videoId: string): File {
    this.videoId = videoId
    return this
  }

  public withState(state: string): File {
    this.state = state
    return this
  }

  public getId(): string {
    return this.id
  }

  public getVideoId(): string {
    return this.videoId
  }

  public getState(): string {
    return this.state
  }

}