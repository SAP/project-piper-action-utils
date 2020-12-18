import * as fs from 'fs'
import * as core from '@actions/core'

const forbiddenChars = /[/:@&!.\s]/

function dirNameToPrefix(dirName: string, prefix?: string) {
  const dirSlug = dirName.replace(forbiddenChars, '_').toUpperCase()
  if (prefix) {
    return `${prefix}_${dirSlug}`
  }

  return dirSlug
}

export function directoryToOutput(path: string, prefix?: string): void {
  if (!fs.statSync(path).isDirectory()) {
    throw new Error(`'${path}' is not a directory`)
  }

  const oldDir = process.cwd()
  process.chdir(path)
  try {
    const files = fs.readdirSync('.')
    for (const dirEnt of files) {
      const stats = fs.statSync(dirEnt)
      if (stats.isDirectory()) {
        directoryToOutput(dirEnt, dirNameToPrefix(process.cwd(), prefix))
      }
      // only files that are under 16 KB are stored as github outputs
      if (stats.size > 16384) {
        core.info(`'${dirEnt}' is bigger than 16KB not registering as output`)
      }

      let outputName = dirEnt.replace(forbiddenChars, '_').toLocaleUpperCase()
      if (prefix) {
        outputName = `${prefix}_${outputName}`
      }

      core.setOutput(outputName, fs.readFileSync(dirEnt).toString())
    }
  } finally {
    process.chdir(oldDir)
  }
}
