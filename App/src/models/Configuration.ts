
export default class Configuration {

  private serverAddress: string
  private networkEnabled: boolean
  private shuffleMode: boolean
  private sortType: string
  private sortOrder: string
  private displayType: string
  private language: string
  private keyboardNavEnabled: boolean
  private partialDownloadEnabled: boolean
  private keys: Map<string, string>

  public constructor(
    serverAddress: string,
    networkEnabled: boolean,
    shuffleMode: boolean,
    sortType: string,
    sortOrder: string,
    displayType: string,
    language: string,
    keyboardNavEnabled: boolean,
    partialDownloadEnabled: boolean,
    keys: Map<string, string>
  ) {
    this.serverAddress = serverAddress
    this.networkEnabled = networkEnabled
    this.shuffleMode = shuffleMode
    this.sortType = sortType
    this.sortOrder = sortOrder
    this.displayType = displayType
    this.language = language
    this.keyboardNavEnabled = keyboardNavEnabled
    this.partialDownloadEnabled = partialDownloadEnabled
    this.keys = keys
  }

  public withServerAddress(address: string): Configuration {
    this.serverAddress = address
    return this
  }

  public withNetworkEnabled(networkEnabled: boolean): Configuration {
    this.networkEnabled = networkEnabled
    return this
  }

  public withShuffleMode(shuffleMode: boolean): Configuration {
    this.shuffleMode = shuffleMode
    return this
  }

  public withSortType(sortType: string): Configuration {
    this.sortType = sortType
    return this
  }

  public withSortOrder(sortOrder: string): Configuration {
    this.sortOrder = sortOrder
    return this
  }

  public withDisplayType(displayType: string): Configuration {
    this.displayType = displayType
    return this
  }

  public withLanguage(language: string): Configuration {
    this.language = language
    return this
  }

  public withKeyboardNav(enabled: boolean): Configuration {
    this.keyboardNavEnabled = enabled
    return this
  }

  public withPartialDownload(enabled: boolean): Configuration {
    this.partialDownloadEnabled = enabled
    return this
  }

  public withKeys(keysObject: any): Configuration {
    this.keys = new Map(Object.entries(keysObject))
    return this
  }

  public getServerAddress(): string {
    return this.serverAddress
  }

  public getNetworkEnabled(): boolean {
    return this.networkEnabled
  }

  public getShuffleMode(): boolean {
    return this.shuffleMode
  }

  public getSortType(): string {
    return this.sortType
  }

  public getSortOrder(): string {
    return this.sortOrder
  }

  public getDisplayType(): string {
    return this.displayType
  }

  public getLanguage(): string {
    return this.language
  }

  public isKeyboardNavEnabled(): boolean {
    return this.keyboardNavEnabled
  }

  public isPartialDownloadEnabled(): boolean {
    return this.partialDownloadEnabled
  }

  public getKey(key: string): string {
    return this.keys.get(key)
  }
}