import { HttpDownloadBuilder } from './http-downloader';
export declare class GithubDownloaderBuilder extends HttpDownloadBuilder {
    protected _githubEndpoint: string;
    protected _githubOrg: string;
    protected _githubApiEndpoint?: string;
    private readonly _githubRepository;
    constructor(githubOrg: string, githubRepository: string, name: string, version: string);
    githubEndpoint(githubEndpoint: string): GithubDownloaderBuilder;
    githubApiEndpoint(apiEndpoint: string): GithubDownloaderBuilder;
    download(): Promise<string>;
    private refreshUrl;
    private getLatestRelease;
    private getApiEndpoint;
}
