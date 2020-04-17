
export default class Configuration {

  serverAddress: string
  networkEnabled: boolean
  shuffleMode: boolean
  sortType: string
  sortOrder: string
  displayType: string

  constructor(serverAddress: string, networkEnabled: boolean, shuffleMode: boolean, sortType: string, sortOrder: string, displayType: string) {
    this.serverAddress = serverAddress
    this.networkEnabled = networkEnabled
    this.shuffleMode = shuffleMode
    this.sortType = sortType
    this.sortOrder = sortOrder
    this.displayType = displayType
  }

  withServerAddress(address: string): Configuration {
    this.serverAddress = address
    return this
  }

  withNetworkEnabled(networkEnabled: boolean): Configuration {
    this.networkEnabled = networkEnabled
    return this
  }

  withShuffleMode(shuffleMode: boolean): Configuration {
    this.shuffleMode = shuffleMode
    return this
  }

  withSortType(sortType: string): Configuration {
    this.sortType = sortType
    return this
  }

  withSortOrder(sortOrder: string): Configuration {
    this.sortOrder = sortOrder
    return this
  }

  withDisplayType(displayType: string): Configuration {
    this.displayType = displayType
    return this
  }

  getServerAddress(): string {
    return this.serverAddress
  }

  getNetworkEnabled(): boolean {
    return this.networkEnabled
  }

  getShuffleMode(): boolean {
    return this.shuffleMode
  }

  getSortType(): string {
    return this.sortType
  }

  getSortOrder(): string {
    return this.sortOrder
  }

  getDisplayType(): string {
    return this.displayType
  }

}