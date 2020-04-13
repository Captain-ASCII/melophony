
export default class File {

  private id: string
  private videoId: string
  private state: string

  constructor(id: string, videoId: string, state: string) {
    this.id = id
    this.videoId = videoId
    this.state = state
  }

  withId(id: string): File {
    this.id = id
    return this
  }

  withVideoId(videoId: string): File {
    this.videoId = videoId
    return this
  }

  withState(state: string): File {
    this.state = state
    return this
  }

  getId(): string {
    return this.id
  }

  getVideoId(): string {
    return this.videoId
  }

  getState(): string {
    return this.state
  }

}