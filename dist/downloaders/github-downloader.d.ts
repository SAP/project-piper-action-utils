import { Headers, HttpDownloadBuilder } from './http-downloader';
export interface Release {
    id: string;
    tag_name: string;
    assets: {
        name: string;
        url: string;
    }[];
}
export declare class GithubDownloaderBuilder extends HttpDownloadBuilder {
    protected _githubEndpoint: string;
    protected _githubOrg: string;
    protected _githubApiEndpoint?: string;
    private readonly _githubRepository;
    constructor(githubOrg: string, githubRepository: string, name: string, version: string);
    auth(username?: string, password?: string): GithubDownloaderBuilder;
    githubEndpoint(githubEndpoint: string): GithubDownloaderBuilder;
    githubApiEndpoint(apiEndpoint: string): GithubDownloaderBuilder;
    download(headers?: Headers): Promise<string>;
    private refreshUrl;
    private getReleaseByTag;
    private getLatestRelease;
    private getApiEndpoint;
}
