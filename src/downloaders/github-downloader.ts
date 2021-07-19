import * as core from '@actions/core'
import {Headers, HttpDownloadBuilder} from './http-downloader'

export interface Release {
  id: string
  tag_name: string
  assets: {
    name: string
    url: string
  }[]
}

export class GithubDownloaderBuilder extends HttpDownloadBuilder {
  protected _githubEndpoint = 'https://github.com'
  protected _githubOrg: string
  protected _githubApiEndpoint?: string

  private readonly _githubRepository: string

  constructor(githubOrg: string, githubRepository: string, name: string, version: string) {
    super(name, version, '')
    this._githubOrg = githubOrg
    this._githubRepository = githubRepository
  }

  auth(username?: string, password?: string): GithubDownloaderBuilder {
    super.auth(username, password)
    return this
  }

  public githubEndpoint(githubEndpoint: string): GithubDownloaderBuilder {
    this._githubEndpoint = githubEndpoint
    return this
  }

  public githubApiEndpoint(apiEndpoint: string): GithubDownloaderBuilder {
    this._githubApiEndpoint = apiEndpoint
    return this
  }

  async download(headers: Headers = {}): Promise<string> {
    await this.refreshUrl()
    return super.download({...headers, 'accept': 'application/octet-stream'})
  }

  private async refreshUrl() {
    let release = null
    if (this._version === 'latest' || this._version === 'master' || this._version === '') {
      release = await this.getLatestRelease()
      core.info('Downloading latest release of piper')
    } else if (this._version) {
      release = await this.getReleaseByTag(this._version)
    } else {
      throw new Error('no version specified')
    }
    this._version = release.tag_name
    const assetUrl = release.assets.filter(asset => asset.name == this._name).map(asset => asset.url)[0]
    core.debug(`Downloading from ${assetUrl}`)
    this._url = assetUrl
  }

  private async getReleaseByTag(tagName: string): Promise<Release> {
    core.debug('Loading release for tags')
    const client = this.getHttpClient({accept: 'application/json'})
    const requestUrl = `${this.getApiEndpoint()}/repos/${this._githubOrg}/${this._githubRepository}/releases/tags/${tagName}`
    const res = await client.get(requestUrl)
    const release = await res.data
    core.debug(`latest release was resolved to ${release.tag_name}`)
    return release
  }

  private async getLatestRelease(): Promise<Release> {
    core.debug('Looking up latest release')
    const client = this.getHttpClient({accept: 'application/json'})
    const requestUrl = `${this.getApiEndpoint()}/repos/${this._githubOrg}/${this._githubRepository}/releases/latest`
    const res = await client.get(requestUrl)
    const release = await res.data
    core.debug(`latest release was resolved to ${release.tag_name}`)
    return release
  }

  private getApiEndpoint(): string {
    if (this._githubApiEndpoint) {
      return this._githubApiEndpoint
    }
    const endpoint = new URL(this._githubEndpoint)
    return `${endpoint.protocol}//api.${endpoint.host}`
  }
}
