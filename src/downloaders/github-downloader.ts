import * as core from '@actions/core'
import * as http from '@actions/http-client'
import {HttpDownloadBuilder} from './http-downloader'


export class GithubDownloaderBuilder extends HttpDownloadBuilder {
  protected _githubEndpoint = 'https://github.com'
  protected _githubOrg: string
  protected _githubApiEndpoint?: string

  private readonly _githubRepository: string;

  constructor(githubOrg: string, githubRepository: string, name: string, version: string) {
    super(name, version, '')
    this._githubOrg = githubOrg
    this._githubRepository = githubRepository
  }

  public githubEndpoint(githubEndpoint: string): GithubDownloaderBuilder {
    this._githubEndpoint = githubEndpoint
    return this
  }

  public githubApiEndpoint(apiEndpoint: string): GithubDownloaderBuilder {
    this._githubApiEndpoint = apiEndpoint
    return this
  }

  public async download(): Promise<string> {
    await this.refreshUrl()
    return super.download()
  }

  private async refreshUrl() {
    const commonUrlPrefix = `${this._githubEndpoint}/${this._githubOrg}/${this._githubRepository}/releases`
    if (this._version === 'latest' || this._version === '') {
      this._version = await this.getLatestRelease()
      core.info('Downloading latest release of pipsaper')
      this._url = `${commonUrlPrefix}/latest/download/${this._name}`
    } else {
      core.info(`Downloading tag ${this._version} of piper`)
      this._url = `${commonUrlPrefix}/download/${this._version}/${this._name}`
    }
  }

  private async getLatestRelease(): Promise<string> {
    core.debug('Looking up latest version')
    let headers = {}
    if (this._auth) {
      headers = {...headers, Authorization: this._auth}
    }
    const client = new http.HttpClient('sap-piper-action', [], headers)
    const requestUrl = `${this.getApiEndpoint()}/repos/${this._githubOrg}/${this._githubRepository}/releases/latest`
    const res = await client.get(requestUrl)
    const {tag_name} = JSON.parse(await res.readBody())
    core.debug(`latest version was resolved to ${tag_name}`)
    return tag_name
  }

  private getApiEndpoint(): string {
    if (this._githubApiEndpoint) {
      return this._githubApiEndpoint
    }
    const endpoint = new URL(this._githubEndpoint)
    return `${endpoint.protocol}//api.${endpoint.host}`
  }
}
