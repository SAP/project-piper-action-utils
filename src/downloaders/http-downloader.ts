import * as tc from '@actions/tool-cache'
import * as fs from 'fs'
import * as core from '@actions/core'
import * as pathUtils from 'path'
import https from 'https'
import axios, {AxiosInstance} from 'axios'
import {Stream} from 'stream'

export enum ArchiveType {
  ZIP7,
  TAR,
  ZIP,
  XAR
}

export type Headers = { [k: string]: string }

export class HttpDownloadBuilder {
  protected _url: string

  protected _version: string

  protected readonly _name: string

  protected _auth?: string

  protected _fileToExtract?: string;

  protected _archiveType?: ArchiveType

  protected _fileMode: fs.Mode

  protected _addToPath = true

  protected _additionalHeaders = {}

  /**
   * Constructor
   * @param name the name of the tool which should be download
   * @param version the version of the tool which should be downloaded
   * @param url the url which should be used to download the tools
   */
  constructor(name: string, version: string, url: string) {
    this._url = url
    this._name = name
    this._version = version
    this._fileMode = fs.constants.S_IRUSR | fs.constants.S_IXUSR
    this._archiveType = ArchiveType.ZIP
  }

  /**
   * Tells HttpBuilder that Basic Auth should be used
   * @param username
   * @param password
   */
  public auth(username?: string, password?: string): HttpDownloadBuilder {
    if (!username || !password) {
      this._auth = undefined
      return this
    }
    const encoded = Buffer.from(`${username}:${password}`).toString('base64')
    this._auth = `Basic ${encoded}`
    return this
  }

  /**
   * Defines whether we should add the directory of the tool which we just downloaded added to the PATH variable, so
   * that it can later be used by other steps in this job
   * @param addToPath default is true
   */
  public addToPath(addToPath = true): HttpDownloadBuilder {
    this._addToPath = addToPath
    return this
  }

  /**
   *  Tells http builder that the downloaded file needs to be extracted
   * @param fileToExtract the name of the file inside the archive
   * @param archiveType the archive encoding which is being used
   */
  public extract(fileToExtract: string, archiveType = ArchiveType.ZIP): HttpDownloadBuilder {
    this._fileToExtract = fileToExtract
    this._archiveType = archiveType
    return this
  }

  public chmod(mode: fs.Mode): HttpDownloadBuilder {
    this._fileMode = mode
    return this
  }

  /**
   * Executes the download
   */
  public async download(headers?: Headers): Promise<string> {
    return await this.downloadUsingCache(headers)
  }

  private async downloadUsingCache(headers?: Headers): Promise<string> {
    if (!this._name || !this._version) {
      throw new Error('name should not be empty when downloading with cache')
    }
    const cacheEntry = tc.find(this._name, this._version, 'x64')
    if (cacheEntry) {
      const p = pathUtils.join(cacheEntry, this._name)
      fs.chmodSync(p, this._fileMode)
      this.updatePath(cacheEntry)
      return cacheEntry
    }

    let path = await this.downloadTool(this._url, headers)
    if (this._fileToExtract) {
      const extract = this.getExtractMethod()
      path = await extract(this._fileToExtract)
    }
    fs.chmodSync(path, this._fileMode)
    const retPath = await tc.cacheFile(path, this._name, this._name, this._version)
    this.updatePath(retPath)
    fs.unlinkSync(path)
    return retPath
  }

  private updatePath(retPath: string): void {
    if (this._addToPath) {
      core.addPath(retPath)
    }
  }

  private async downloadTool(url: string, headers?: Headers): Promise<string> {
    const client = this.getHttpClient(headers)
    const response = await client.get(url, {responseType: 'stream'})
    return this.streamToDisk(response.data)
  }

  protected getHttpClient(headers: Headers = {}): AxiosInstance {
    if (this._auth) {
      headers = {...headers, authorization: this._auth}
    }
    headers = {...headers, 'User-Agent': 'sap-piper-action'}
    const agent = new https.Agent({
      rejectUnauthorized: false
    })
    return axios.create({
      headers: headers,
      httpsAgent: agent
    })
  }

  private async streamToDisk(downloadStream: Stream): Promise<string> {
    const tmpPath = `${process.env.RUNNER_TEMP}/piper-download-${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`
    const writeStream = fs.createWriteStream(tmpPath)
    downloadStream.pipe(writeStream)
    return new Promise((resolve, reject) => {
      let error = false
      downloadStream.on('error', (err: Error) => {
        error = true
        writeStream.close()
        fs.unlinkSync(tmpPath)
        reject(err)
      })
      downloadStream.on('close', async () => {
        if (!error) {
          writeStream.close()
          resolve(tmpPath)
        }
      })
    })
  }

  private getExtractMethod() {
    switch (this._archiveType) {
    case ArchiveType.TAR:
      return tc.extractTar
    case ArchiveType.XAR:
      return tc.extractXar
    case ArchiveType.ZIP7:
      return tc.extract7z
    case ArchiveType.ZIP:
      return tc.extractZip
    default:
      return tc.extractZip
    }
  }
}
