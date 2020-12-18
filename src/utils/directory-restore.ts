import * as artifact from '@actions/artifact'
import * as glob from '@actions/glob'
import * as fs from 'fs'
import * as core from '@actions/core'

/**
 * DirectoryRestore is able to save and restore a directory between jobs by uploading them as an artifact
 */
export class DirectoryRestore {
  constructor(private readonly directory: string, private readonly artifactName = '.restore') {
  }

  public async save(): Promise<artifact.UploadResponse> {
    const filesToUpload: string[] = []
    const globber = await glob.create(this.directory)
    for await (const file of globber.globGenerator()) {
      if (!fs.statSync(file).isDirectory()) {
        filesToUpload.push(file)
      }
    }
    return artifact.create().uploadArtifact(this.artifactName, filesToUpload, this.directory)
  }

  public async load(): Promise<artifact.DownloadResponse> {
    try {
      return await artifact.create().downloadArtifact(this.artifactName, this.directory)
    } catch (err) {
      core.debug(`Unable to restore ${this.directory}`)
      return err
    }
  }

}
