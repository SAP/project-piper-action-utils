import {GithubDownloaderBuilder} from './downloaders'

export * from './downloaders'
export * from './utils'
export * from './output-generators'


new GithubDownloaderBuilder('SAP', 'jenkins-library', 'piper', 'latest').download()
