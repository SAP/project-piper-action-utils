/// <reference types="node" />
import * as fs from 'fs';
export declare enum ArchiveType {
    ZIP7 = 0,
    TAR = 1,
    ZIP = 2,
    XAR = 3
}
export declare class HttpDownloadBuilder {
    protected _url: string;
    protected _version?: string;
    protected readonly _name: string;
    protected _auth?: string;
    protected _fileToExtract?: string;
    protected _archiveType?: ArchiveType;
    protected _fileMode: fs.Mode;
    protected _addToPath: boolean;
    /**
     * Constructor
     * @param name the name of the tool which should be download
     * @param version the version of the tool which should be downloaded
     * @param url the url which should be used to download the tools
     */
    constructor(name: string, version: string, url: string);
    /**
     * Tells HttpBuilder that Basic Auth should be used
     * @param username
     * @param password
     */
    auth(username?: string, password?: string): HttpDownloadBuilder;
    /**
     * Defines whether we should add the directory of the tool which we just downloaded added to the PATH variable, so
     * that it can later be used by other steps in this job
     * @param addToPath default is true
     */
    addToPath(addToPath?: boolean): HttpDownloadBuilder;
    /**
     *  Tells http builder that the downloaded file needs to be extracted
     * @param fileToExtract the name of the file inside the archive
     * @param archiveType the archive encoding which is being used
     */
    extract(fileToExtract: string, archiveType?: ArchiveType): HttpDownloadBuilder;
    chmod(mode: fs.Mode): HttpDownloadBuilder;
    /**
     * Executes the download
     */
    download(): Promise<string>;
    private downloadUsingCache;
    private getExtractMethod;
}
